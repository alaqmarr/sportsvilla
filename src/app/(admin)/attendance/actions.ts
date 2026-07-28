"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bumpSyncTimestamp } from '@/lib/sync';
import { getISTDateBounds } from "@/lib/dateUtils";

export async function fetchMembers(identifier: string) {
  const isMobile = /^\d{10}$/.test(identifier);
  const whereClause = isMobile ? { mobile: identifier } : { id: identifier };

  const members = await prisma.member.findMany({
    where: whereClause,
    include: {
      memberships: {
        where: {
          status: "ACTIVE",
          endDate: { gte: new Date() }
        },
        include: {
          membershipPlan: {
            include: { sport: true }
          }
        }
      }
    }
  });

  if (members.length === 0) return null;

  return Promise.all(members.map(async (member) => {
    const enhancedMemberships = await Promise.all(
    member.memberships.map(async (m) => {
      const attendedCount = await prisma.attendance.count({
        where: {
          memberId: member.id,
          membershipPlanId: m.membershipPlanId,
          date: {
            gte: m.startDate,
            lte: m.endDate
          }
        }
      });

      const now = new Date();
      const end = new Date(m.endDate);
      const start = new Date(m.startDate);
      
      const msLeft = end.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

      const msElapsed = now.getTime() - start.getTime();
      const daysElapsed = Math.max(0, Math.floor(msElapsed / (1000 * 60 * 60 * 24)));
      const missedCount = Math.max(0, daysElapsed - attendedCount);

      return {
        ...m,
        stats: {
          attended: attendedCount,
          missed: missedCount,
          daysLeft: daysLeft
        }
      };
    })
    );

    return {
      ...member,
      memberships: enhancedMemberships
    };
  }));
}

export async function markAttendance(data: { memberId: string; sportId: string; membershipPlanId: string; notes?: string }) {
  // 1. Check slots for today for this specific plan
  const { start: todayStart, end: todayEnd } = getISTDateBounds();

  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.membershipPlanId }});
  if (!plan) throw new Error("Plan not found");

  const memberMembership = await prisma.memberMembership.findFirst({
    where: {
      memberId: data.memberId,
      membershipPlanId: data.membershipPlanId,
      status: "ACTIVE",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() }
    }
  });

  if (!memberMembership) throw new Error("Active membership not found for this member and plan.");

  if (memberMembership.allowedDays) {
    const todayDay = new Date().getDay(); // 0 = Sun, 1 = Mon...
    const allowedDaysArray = memberMembership.allowedDays.split(',').map(Number);
    if (!allowedDaysArray.includes(todayDay)) {
      const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      throw new Error(`Membership is not valid on ${daysMap[todayDay]}.`);
    }
  }

  const todayVisits = await prisma.attendance.count({
    where: {
      memberId: data.memberId,
      membershipPlanId: data.membershipPlanId,
      date: {
        gte: todayStart,
        lte: todayEnd
      }
    }
  });

  if (todayVisits >= plan.slotsPerDay) {
    throw new Error(`Limit reached! This plan allows ${plan.slotsPerDay} visit(s) per day.`);
  }

  const attendance = await prisma.attendance.create({
    data: {
      memberId: data.memberId,
      sportId: data.sportId,
      membershipPlanId: data.membershipPlanId,
      notes: data.notes || null,
      status: "PRESENT",
      date: new Date()
    },
    include: {
      member: true,
      sport: true,
      membershipPlan: true
    }
  });

  if (plan.rewardPointsPerCheckin > 0) {
    // Increment loyalty points for check-in
    await prisma.member.update({
      where: { id: data.memberId },
      data: { loyaltyPoints: { increment: plan.rewardPointsPerCheckin } }
    });
    
    await prisma.loyaltyHistory.create({
      data: {
        memberId: data.memberId,
        points: plan.rewardPointsPerCheckin,
        type: "EARNED",
        source: "CHECKIN",
        description: `Earned for membership attendance: ${plan.name}`
      }
    });
  }

  await bumpSyncTimestamp('attendance');
  revalidatePath("/", "layout");
  revalidatePath("/", "layout");
  return attendance;
}
