import { prisma } from "@/core/database/prisma";
import { getISTDateBounds } from "@/core/utils/dateUtils";
import { calculateMembershipStats, validateAllowedDay } from "./attendance.helper";

export async function fetchMembersCore(identifier: string) {
  const isMobile = /^\d{10}$/.test(identifier);
  const whereClause = isMobile ? { mobile: identifier } : { id: identifier };

  const members = await prisma.member.findMany({
    where: whereClause,
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: {
          membershipPlan: {
            include: { sport: true },
          },
        },
      },
    },
  });

  if (members.length === 0) return null;

  return Promise.all(
    members.map(async (member) => {
      const enhancedMemberships = await Promise.all(
        member.memberships.map(async (m) => {
          const attendedCount = await prisma.attendance.count({
            where: {
              memberId: member.id,
              membershipPlanId: m.membershipPlanId,
              date: {
                gte: m.startDate,
                lte: m.endDate,
              },
            },
          });

          const stats = calculateMembershipStats(
            new Date(m.startDate),
            new Date(m.endDate),
            attendedCount
          );

          return {
            ...m,
            stats,
          };
        })
      );

      return {
        ...member,
        memberships: enhancedMemberships,
      };
    })
  );
}

export interface MarkAttendanceInput {
  memberId: string;
  sportId: string;
  membershipPlanId: string;
  notes?: string;
}

export async function markAttendanceCore(data: MarkAttendanceInput) {
  const { start: todayStart, end: todayEnd } = getISTDateBounds();

  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.membershipPlanId } });
  if (!plan) throw new Error("Plan not found");

  const memberMembership = await prisma.memberMembership.findFirst({
    where: {
      memberId: data.memberId,
      membershipPlanId: data.membershipPlanId,
      status: "ACTIVE",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  if (!memberMembership) {
    throw new Error("Active membership not found for this member and plan.");
  }

  validateAllowedDay(memberMembership.allowedDays);

  const todayVisits = await prisma.attendance.count({
    where: {
      memberId: data.memberId,
      membershipPlanId: data.membershipPlanId,
      date: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  if (todayVisits >= plan.slotsPerDay) {
    throw new Error(`Limit reached! This plan allows ${plan.slotsPerDay} visit(s) per day.`);
  }

  const attendance = await prisma.$transaction(async (tx) => {
    const att = await tx.attendance.create({
      data: {
        memberId: data.memberId,
        sportId: data.sportId,
        membershipPlanId: data.membershipPlanId,
        notes: data.notes || null,
        status: "PRESENT",
        date: new Date(),
      },
      include: {
        member: true,
        sport: true,
        membershipPlan: true,
      },
    });

    if (plan.rewardPointsPerCheckin > 0) {
      await tx.member.update({
        where: { id: data.memberId },
        data: { loyaltyPoints: { increment: plan.rewardPointsPerCheckin } },
      });

      await tx.loyaltyHistory.create({
        data: {
          memberId: data.memberId,
          points: plan.rewardPointsPerCheckin,
          type: "EARNED",
          source: "CHECKIN",
          description: `Earned for membership attendance: ${plan.name}`,
        },
      });
    }
    return att;
  });

  return attendance;
}
