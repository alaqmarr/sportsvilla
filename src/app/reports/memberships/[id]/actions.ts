"use server";

import { prisma } from "@/lib/prisma";

export async function fetchMembershipDetail(id: string) {
  try {
    const membership = await prisma.memberMembership.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            attendances: {
              where: {
                membershipPlanId: undefined // Wait, attendances might just be linked to member, let's fetch all attendances for this member and filter them later, or just fetch all
              },
              include: {
                sport: true,
                membershipPlan: true
              }
            }
          }
        },
        membershipPlan: {
          include: { sport: true }
        }
      }
    });
    
    if (!membership) {
      throw new Error("Membership not found");
    }

    // Filter attendances that fall strictly within this membership's start and end dates
    const start = new Date(membership.startDate);
    const end = new Date(membership.endDate);
    
    membership.member.attendances = membership.member.attendances.filter(
      (a: any) => new Date(a.date) >= start && new Date(a.date) <= end
    );

    return membership;
  } catch (error) {
    console.error("Failed to fetch membership detail", error);
    throw new Error("Failed to fetch membership detail");
  }
}
