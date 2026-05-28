"use server";

import { prisma } from "@/lib/prisma";

export async function fetchAdvancedAttendance(
  startDateStr: string,
  endDateStr: string,
  startTimeStr: string = "00:00",
  endTimeStr: string = "23:59",
  planId?: string
) {
  try {
    const startDate = new Date(`${startDateStr}T${startTimeStr}:00`);
    const endDate = new Date(`${endDateStr}T${endTimeStr}:59.999`);

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (planId && planId !== "all") {
      whereClause.membershipPlanId = planId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        member: true,
        membershipPlan: {
          include: {
            sport: true,
          }
        },
        sport: true,
      },
      orderBy: {
        date: "desc"
      }
    });

    return attendances;
  } catch (error) {
    console.error("Failed to fetch advanced attendance", error);
    throw new Error("Failed to fetch attendance reports");
  }
}
