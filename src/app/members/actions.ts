"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

async function generateMemberId(mobile: string) {
  const count = await prisma.member.count({ where: { mobile } });
  return `${mobile}_${count + 1}`;
}

export async function createMember(data: { name: string; mobile: string; email?: string }) {
  const id = await generateMemberId(data.mobile);
  const member = await prisma.member.create({
    data: {
      id,
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
    },
    include: { memberships: { include: { membershipPlan: { include: { sport: true } } } } }
  });
  revalidatePath("/", "layout");
  return member;
}

export async function createFamily(data: { mobile: string; members: { name: string; email?: string }[] }) {
  if (data.members.length === 0) throw new Error("At least one member is required");
  
  // Create all family members sequentially to ensure correct ID generation
  const createdMembers = [];
  for (const m of data.members) {
    const id = await generateMemberId(data.mobile);
    const member = await prisma.member.create({
      data: {
        id,
        name: m.name,
        mobile: data.mobile,
        email: m.email || null,
      }
    });
    createdMembers.push(member);
  }
  
  revalidatePath("/", "layout");
  return createdMembers;
}

export async function updateMember(id: string, data: { name: string; mobile: string; email?: string }) {
  const member = await prisma.member.update({
    where: { id },
    data: {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
    },
  });
  revalidatePath("/", "layout");
  return member;
}

export async function deleteMember(id: string) {
  await prisma.member.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function assignPlan(data: { memberIds?: string[]; memberId?: string; mobile?: string; name?: string; email?: string; planId: string; startDate: string }) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId }});
  if (!plan) throw new Error("Plan not found");
  
  let targetMemberIds: string[] = [];

  if (data.memberIds && data.memberIds.length > 0) {
    targetMemberIds = data.memberIds;
  } else if (data.memberId) {
    targetMemberIds = [data.memberId];
  } else if (data.mobile) {
    // If multiple members exist with this mobile, findFirst picks the oldest or we should require memberId
    const member = await prisma.member.findFirst({ where: { mobile: data.mobile } });
    if (!member) {
      if (!data.name) throw new Error("Member not found. Name is required to create.");
      const id = await generateMemberId(data.mobile);
      const newMember = await prisma.member.create({
        data: { id, mobile: data.mobile, name: data.name, email: data.email || null }
      });
      targetMemberIds = [newMember.id];
    } else {
      targetMemberIds = [member.id];
    }
  }

  if (targetMemberIds.length === 0) throw new Error("Member(s) required");

  // Validate family plan size constraints
  if (plan.isFamilyPlan && plan.familySize && targetMemberIds.length > plan.familySize) {
    throw new Error(`This Family Plan allows a maximum of ${plan.familySize} members. You selected ${targetMemberIds.length}.`);
  }

  const start = new Date(data.startDate);
  const end = addDays(start, plan.durationInDays);
  
  const createdMemberships = [];

  for (const tMemberId of targetMemberIds) {
    // Prevent overlapping assignment of the exact same plan
    const overlappingPlan = await prisma.memberMembership.findFirst({
      where: {
        memberId: tMemberId,
        membershipPlanId: data.planId,
        status: "ACTIVE",
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } }
        ]
      }
    });

    if (overlappingPlan) {
      throw new Error(`Overlapping dates: Member with ID ${tMemberId} already has an active assignment for this plan during this period.`);
    }

    const memberMembership = await prisma.memberMembership.create({
      data: {
        memberId: tMemberId,
        membershipPlanId: data.planId,
        startDate: start,
        endDate: end,
        status: "ACTIVE"
      },
      include: { membershipPlan: true }
    });
    
    createdMemberships.push(memberMembership);
  }
  
  revalidatePath("/", "layout");
  return createdMemberships;
}
