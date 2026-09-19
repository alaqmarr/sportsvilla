import { prisma } from "@/core/database/prisma";
import { startOfDay } from "date-fns";

export type LookupCardOwnerResult =
  | {
      success: true;
      member: {
        id: string;
        name: string;
        mobile: string;
        walletBalance: number;
      };
      cardId: string;
      cardUid: string;
      error?: undefined;
    }
  | {
      success: false;
      error: string;
      member?: undefined;
      cardId?: undefined;
      cardUid?: undefined;
    };

export async function getMemberDetailsByCardCore(uid: string) {
  const today = startOfDay(new Date());

  return await prisma.nfcCard.findUnique({
    where: { cardUid: uid.toUpperCase() },
    include: {
      member: {
        include: {
          bookings: {
            where: {
              startTime: {
                gte: today,
              },
            },
            orderBy: {
              startTime: "asc",
            },
          },
          walletTransactions: {
            take: 5,
            orderBy: {
              createdAt: "desc",
            },
          },
          memberships: {
            where: {
              status: "ACTIVE",
              endDate: {
                gte: today,
              },
            },
            include: {
              membershipPlan: true,
              turf: true,
            },
          },
        },
      },
    },
  });
}

export async function lookupCardOwnerCore(uid: string): Promise<LookupCardOwnerResult> {
  const card = await prisma.nfcCard.findUnique({
    where: { cardUid: uid },
    include: { member: true },
  });

  if (!card) {
    return { success: false, error: "Card not found in the system." };
  }

  if (!card.member) {
    return { success: false, error: "Card is not assigned to any member." };
  }

  if (card.status !== "ACTIVE") {
    return { success: false, error: `Card is ${card.status.toLowerCase()}.` };
  }

  return {
    success: true,
    member: {
      id: card.member.id,
      name: card.member.name,
      mobile: card.member.mobile,
      walletBalance: card.member.walletBalance,
    },
    cardId: card.id,
    cardUid: card.cardUid,
  };
}
