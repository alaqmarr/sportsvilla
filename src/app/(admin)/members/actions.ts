"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { bumpSyncTimestamp } from '@/lib/sync';
import { getISTDateBounds } from "@/lib/dateUtils";
import { sendWhatsAppMemberRegisteredTemplate, sendWhatsAppMembershipPurchasedTemplate } from "@/lib/whatsapp";
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

  try {
    await sendWhatsAppMemberRegisteredTemplate(member.name, member.mobile);
  } catch (waError) {
    console.error('WhatsApp welcome message failed', waError);
  }

  await bumpSyncTimestamp('member');
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
    
    try {
      await sendWhatsAppMemberRegisteredTemplate(member.name, member.mobile);
    } catch (waError) {
      console.error('WhatsApp welcome message failed for family member', waError);
    }

    createdMembers.push(member);
  }
  
  await bumpSyncTimestamp('member');
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
  await bumpSyncTimestamp('member');
  revalidatePath("/", "layout");
  return member;
}

export async function deleteMember(id: string) {
  await prisma.member.delete({ where: { id } });
  await bumpSyncTimestamp('member');
  revalidatePath("/", "layout");
}

export async function assignPlan(data: { memberIds?: string[]; memberId?: string; mobile?: string; name?: string; email?: string; planId: string; startDate: string; turfId?: string; timeSlot?: string }) {
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

      try {
        await sendWhatsAppMemberRegisteredTemplate(newMember.name, newMember.mobile);
      } catch (waError) {
        console.error('WhatsApp welcome message failed', waError);
      }

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
    const memberMembership = await prisma.$transaction(async (tx) => {
      // Prevent overlapping assignment of the exact same plan
      const overlappingPlan = await tx.memberMembership.findFirst({
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

      const created = await tx.memberMembership.create({
        data: {
          memberId: tMemberId,
          membershipPlanId: data.planId,
          startDate: start,
          endDate: end,
          status: "ACTIVE",
          turfId: data.turfId || null,
          timeSlot: data.timeSlot || null
        },
        include: { membershipPlan: true }
      });
      
      if (plan.rewardPointsOnPurchase > 0) {
        await tx.member.update({
          where: { id: tMemberId },
          data: { loyaltyPoints: { increment: plan.rewardPointsOnPurchase } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: tMemberId,
            points: plan.rewardPointsOnPurchase,
            type: "EARNED",
            source: "MEMBERSHIP",
            description: `Earned for purchasing membership: ${plan.name}`
          }
        });
      }
      
      return created;
    });

    // Send Membership Notification
    try {
      const member = await prisma.member.findUnique({ where: { id: tMemberId } });
      if (member) {
        let turfName = "Sports Villa";
        if (data.turfId) {
          const turf = await prisma.turf.findUnique({ where: { id: data.turfId } });
          if (turf) turfName = turf.name;
        }
        const eligibleSlot = data.timeSlot || "Any open slot";
        const validUntil = new Date(memberMembership.endDate).toLocaleDateString('en-IN');

        await sendWhatsAppMembershipPurchasedTemplate(
          member.name,
          plan.name,
          turfName,
          eligibleSlot,
          validUntil,
          member.mobile
        );
      }
    } catch (waError) {
      console.error('WhatsApp membership purchased message failed', waError);
    }

    createdMemberships.push(memberMembership);
  }
  
  await bumpSyncTimestamp('member');
  revalidatePath("/", "layout");
  return createdMemberships;
}

export async function updateMemberMembership(id: string, data: { startDate?: string, endDate?: string, status?: string, turfId?: string, timeSlot?: string }) {
  const updateData: any = {};
  if (data.startDate) {
    updateData.startDate = getISTDateBounds(data.startDate).start;
  }
  if (data.endDate) {
    updateData.endDate = getISTDateBounds(data.endDate).end;
  }
  if (data.status) {
    updateData.status = data.status;
  }
  if (data.turfId !== undefined) {
    updateData.turfId = data.turfId || null;
  }
  if (data.timeSlot !== undefined) {
    updateData.timeSlot = data.timeSlot || null;
  }
  
  const updated = await prisma.memberMembership.update({
    where: { id },
    data: updateData,
    include: { member: true, membershipPlan: true }
  });

  // Trigger WhatsApp event if status changed to EXPIRED
  if (data.status === "EXPIRED") {
    try {
      const { sendEventMessage } = require("@/lib/whatsapp");
      const payload = {
        member: { name: updated.member.name, mobile: updated.member.mobile },
        membership: { 
          planName: updated.membershipPlan.name, 
          endDate: updated.endDate.toISOString().split("T")[0]
        }
      };
      sendEventMessage("MEMBERSHIP_EXPIRED", updated.member.mobile, payload).catch(console.error);
    } catch (e) {
      console.error("Failed to send WhatsApp Event", e);
    }
  }

  await bumpSyncTimestamp('member');
  revalidatePath("/", "layout");
  return updated;
}

export async function deleteMemberMembership(id: string) {
  await prisma.memberMembership.delete({
    where: { id }
  });
  await bumpSyncTimestamp('member');
  revalidatePath("/", "layout");
}

export async function resetWallet(id: string) {
  const result = await prisma.$transaction(async (tx) => {
    const member = await tx.member.findUnique({ where: { id }});
    if (!member) throw new Error("Member not found");
    
    if (member.walletBalance === 0) return member;
    
    const updated = await tx.member.update({
      where: { id },
      data: { walletBalance: 0 }
    });
    
    await tx.walletTransaction.create({
      data: {
        memberId: id,
        amount: -member.walletBalance,
        type: "DEBIT",
        description: "Wallet reset by admin",
      }
    });
    return updated;
  });
  await bumpSyncTimestamp('member');
  revalidatePath("/", "layout");
  return result;
}
