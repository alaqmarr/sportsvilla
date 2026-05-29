"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchMemberByMobile(mobile: string) {
  const member = await prisma.member.findUnique({
    where: { mobile },
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

  if (!member) return null;

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
}

export async function markAttendance(data: { memberId: string; sportId: string; membershipPlanId: string; notes?: string }) {
  // 1. Check slots for today for this specific plan
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);

  const plan = await prisma.membershipPlan.findUnique({ where: { id: data.membershipPlanId }});
  if (!plan) throw new Error("Plan not found");

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

  revalidatePath("/", "layout");
  revalidatePath("/", "layout");
  return attendance;
}
