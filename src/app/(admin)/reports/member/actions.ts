"use server";
import { prisma } from "@/lib/prisma";

export async function fetchAttendanceReport(mobile: string) {
  const members = await prisma.member.findMany({
    where: { mobile },
    include: {
      memberships: {
        include: {
          membershipPlan: {
            include: { sport: true }
          }
        },
        orderBy: {
          startDate: 'desc'
        }
      },
      attendances: {
        include: {
          sport: true,
          membershipPlan: true
        },
        orderBy: {
          date: 'desc'
        }
      }
    }
  });

  return members;
}
