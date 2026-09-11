export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getISTDateBounds } from "@/lib/dateUtils";
import KioskClient from "./KioskClient";

export default async function NfcKioskPage() {
  const { start: todayStart } = getISTDateBounds();

  // Preload initial recent check-in transactions for the live activity feed
  const initialTransactions = await prisma.nfcTransaction.findMany({
    where: {
      type: { in: ["CHECKIN", "DROPIN"] },
      createdAt: {
        gte: new Date(todayStart.getTime() - 24 * 60 * 60 * 1000),
      },
    },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          mobile: true,
          walletBalance: true,
        },
      },
      booking: {
        select: {
          id: true,
          sport: { select: { name: true } },
          turf: { select: { name: true } },
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return <KioskClient initialTransactions={initialTransactions} />;
}
