"use server";

import { prisma } from "@/lib/prisma";

export async function fetchPlanDetail(planId: string) {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId },
      include: {
        sport: true,
        memberships: {
          include: {
            member: {
              include: {
                attendances: {
                  where: {
                    date: { gte: startOfMonth }
                  }
                }
              }
            }
          },
          orderBy: {
            endDate: 'desc'
          }
        }
      }
    });
    
    if (!plan) {
      throw new Error("Plan not found");
    }

    return plan;
  } catch (error) {
    console.error("Failed to fetch plan detail", error);
    throw new Error("Failed to fetch plan detail");
  }
}
