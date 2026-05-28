"use server";

import { prisma } from "@/lib/prisma";

export async function fetchMembershipReports(startDateStr: string, endDateStr: string) {
  try {
    const start = new Date(`${startDateStr}T00:00:00`);
    const end = new Date(`${endDateStr}T23:59:59.999`);

    // Overlap condition: membership starts before the period ends, and ends after the period starts
    const memberships = await prisma.memberMembership.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start }
      },
      include: {
        member: {
          include: {
            attendances: {
              where: {
                date: {
                  gte: start,
                  lte: end
                }
              }
            },
            memberships: true
          }
        },
        membershipPlan: {
          include: { sport: true }
        }
      },
      orderBy: {
        startDate: "desc"
      }
    });

    return memberships;
  } catch (error) {
    console.error("Failed to fetch membership reports", error);
    throw new Error("Failed to fetch membership reports");
  }
}
