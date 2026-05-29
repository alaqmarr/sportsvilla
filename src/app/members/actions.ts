"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

export async function createMember(data: { name: string; mobile: string; email?: string }) {
  const member = await prisma.member.create({
    data: {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
    },
    include: { memberships: { include: { membershipPlan: { include: { sport: true } } } } }
  });
  revalidatePath("/", "layout");
  return member;
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

export async function assignPlan(data: { mobile: string; name?: string; email?: string; planId: string; startDate: string }) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId }});
  if (!plan) throw new Error("Plan not found");
  
  let member = await prisma.member.findUnique({ where: { mobile: data.mobile } });
  if (!member) {
    if (!data.name) throw new Error("Member not found. Name is required to create.");
    member = await prisma.member.create({
      data: { mobile: data.mobile, name: data.name, email: data.email || null }
    });
  }

  const start = new Date(data.startDate);
  const end = addDays(start, plan.durationInDays);
  
  // Prevent overlapping assignment of the exact same plan
  const overlappingPlan = await prisma.memberMembership.findFirst({
    where: {
      memberId: member.id,
      membershipPlanId: data.planId,
      status: "ACTIVE",
      AND: [
        { startDate: { lte: end } },
        { endDate: { gte: start } }
      ]
    }
  });

  if (overlappingPlan) {
    throw new Error("Overlapping dates: This member already has an active assignment for this plan during this period.");
  }

  const memberMembership = await prisma.memberMembership.create({
    data: {
      memberId: member.id,
      membershipPlanId: data.planId,
      startDate: start,
      endDate: end,
      status: "ACTIVE"
    },
    include: { membershipPlan: true }
  });
  
  revalidatePath("/", "layout");
  revalidatePath("/", "layout");
  return memberMembership;
}
