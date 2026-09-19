import { prisma } from "@/core/database/prisma";
import { generateMemberId } from "@/modules/members/members.helper";
import { calculateMembershipDateRange, parseAllowedDays } from "./members.helper";
import { getISTDateBounds } from "@/core/utils/dateUtils";

export interface CreateMemberInput {
  name: string;
  mobile: string;
  email?: string;
}

export interface CreateFamilyInput {
  mobile: string;
  members: { name: string; email?: string }[];
}

export interface UpdateMemberInput {
  name: string;
  mobile: string;
  email?: string;
}

export interface AssignPlanInput {
  memberIds?: string[];
  memberId?: string;
  mobile?: string;
  name?: string;
  email?: string;
  planId: string;
  startDate: string;
  turfId?: string;
  timeSlot?: string;
  allowedDays?: number[];
}

export interface UpdateMemberMembershipInput {
  startDate?: string;
  endDate?: string;
  status?: string;
  turfId?: string;
  timeSlot?: string;
}

export async function createMemberCore(data: CreateMemberInput) {
  const id = await generateMemberId(data.mobile);
  return await prisma.member.create({
    data: {
      id,
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
    },
    include: {
      memberships: {
        include: {
          membershipPlan: {
            include: { sport: true },
          },
        },
      },
    },
  });
}

export async function createFamilyCore(data: CreateFamilyInput) {
  if (data.members.length === 0) {
    throw new Error("At least one member is required");
  }

  const createdMembers = [];
  for (const m of data.members) {
    const id = await generateMemberId(data.mobile);
    const member = await prisma.member.create({
      data: {
        id,
        name: m.name,
        mobile: data.mobile,
        email: m.email || null,
      },
    });
    createdMembers.push(member);
  }
  return createdMembers;
}

export async function updateMemberCore(id: string, data: UpdateMemberInput) {
  return await prisma.member.update({
    where: { id },
    data: {
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
    },
  });
}

export async function deleteMemberCore(id: string) {
  return await prisma.member.delete({ where: { id } });
}

export async function assignPlanCore(data: AssignPlanInput) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.planId } });
  if (!plan) throw new Error("Plan not found");

  let targetMemberIds: string[] = [];

  if (data.memberIds && data.memberIds.length > 0) {
    targetMemberIds = data.memberIds;
  } else if (data.memberId) {
    targetMemberIds = [data.memberId];
  } else if (data.mobile) {
    const member = await prisma.member.findFirst({
      where: { mobile: data.mobile },
      orderBy: { joinDate: "asc" },
    });
    if (!member) {
      if (!data.name) throw new Error("Member not found. Name is required to create.");
      const id = await generateMemberId(data.mobile);
      const newMember = await prisma.member.create({
        data: { id, mobile: data.mobile, name: data.name, email: data.email || null },
      });
      targetMemberIds = [newMember.id];
    } else {
      targetMemberIds = [member.id];
    }
  }

  if (targetMemberIds.length === 0) throw new Error("Member(s) required");

  if (plan.isFamilyPlan && plan.familySize && targetMemberIds.length > plan.familySize) {
    throw new Error(
      `This Family Plan allows a maximum of ${plan.familySize} members. You selected ${targetMemberIds.length}.`
    );
  }

  const { start, end } = calculateMembershipDateRange(data.startDate, plan.durationInDays);
  const allowedDaysFormatted = parseAllowedDays(data.allowedDays);

  const createdMemberships = [];

  for (const tMemberId of targetMemberIds) {
    const memberMembership = await prisma.$transaction(async (tx) => {
      const overlappingPlan = await tx.memberMembership.findFirst({
        where: {
          memberId: tMemberId,
          membershipPlanId: data.planId,
          status: "ACTIVE",
          AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }],
        },
      });

      if (overlappingPlan) {
        throw new Error(
          `Overlapping dates: Member with ID ${tMemberId} already has an active assignment for this plan during this period.`
        );
      }

      const created = await tx.memberMembership.create({
        data: {
          memberId: tMemberId,
          membershipPlanId: data.planId,
          startDate: start,
          endDate: end,
          status: "ACTIVE",
          turfId: data.turfId || null,
          timeSlot: data.timeSlot || null,
          allowedDays: allowedDaysFormatted,
        },
        include: { membershipPlan: true, member: true },
      });

      if (plan.rewardPointsOnPurchase > 0) {
        await tx.member.update({
          where: { id: tMemberId },
          data: { loyaltyPoints: { increment: plan.rewardPointsOnPurchase } },
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: tMemberId,
            points: plan.rewardPointsOnPurchase,
            type: "EARNED",
            source: "MEMBERSHIP",
            description: `Earned for purchasing membership: ${plan.name}`,
          },
        });
      }

      return created;
    });

    createdMemberships.push(memberMembership);
  }

  return { plan, createdMemberships };
}

export async function updateMemberMembershipCore(id: string, data: UpdateMemberMembershipInput) {
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

  return await prisma.memberMembership.update({
    where: { id },
    data: updateData,
    include: { member: true, membershipPlan: true },
  });
}

export async function deleteMemberMembershipCore(id: string) {
  return await prisma.memberMembership.delete({
    where: { id },
  });
}

export async function resetWalletCore(id: string) {
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) throw new Error("Member not found");

  if (member.walletBalance === 0) return { member, previousBalance: 0 };

  const previousBalance = member.walletBalance;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.member.update({
      where: { id },
      data: { walletBalance: 0 },
    });

    await tx.walletTransaction.create({
      data: {
        memberId: id,
        amount: member.walletBalance,
        type: "DEBIT",
        description: "Wallet reset by admin",
      },
    });
    return updated;
  });

  return { member: result, previousBalance };
}
