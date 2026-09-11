"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay } from "date-fns";

export async function getMemberDetailsByCard(uid: string) {
  const today = startOfDay(new Date());

  const card = await prisma.nfcCard.findUnique({
    where: { cardUid: uid.toUpperCase() },
    include: {
      member: {
        include: {
          bookings: {
            where: {
              startTime: {
                gte: today
              }
            },
            orderBy: {
              startTime: 'asc'
            }
          },
          walletTransactions: {
            take: 5,
            orderBy: {
              createdAt: 'desc'
            }
          },
          memberships: {
            where: {
              status: "ACTIVE",
              endDate: {
                gte: today
              }
            },
            include: {
              membershipPlan: true,
              turf: true
            }
          }
        }
      }
    }
  });

  return card;
}
