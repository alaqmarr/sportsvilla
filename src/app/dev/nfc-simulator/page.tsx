import { prisma } from "@/lib/prisma";
import { NfcSimulatorClient } from "./NfcSimulatorClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "NFC Hardware Simulator & QA Lab | SportsVilla Dev",
  description: "Interactive hardware test harness for NFC cards, keyboard wedge, and payment simulation.",
};

export default async function NfcSimulatorPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // 1. Fetch live cards with linked members and transaction count
  const cards = await prisma.nfcCard.findMany({
    include: {
      member: {
        select: {
          id: true,
          name: true,
          mobile: true,
          walletBalance: true,
          loyaltyPoints: true,
        },
      },
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  // 2. Fetch today's bookings with tickets
  const bookings = await prisma.booking.findMany({
    where: {
      startTime: { lte: endOfToday },
      endTime: { gte: startOfToday },
    },
    include: {
      member: { select: { id: true, name: true, mobile: true } },
      sport: { select: { name: true } },
      turf: { select: { name: true } },
      tickets: true,
    },
    orderBy: { startTime: "asc" },
    take: 30,
  });

  // 3. Fetch recent NFC transactions
  const transactions = await prisma.nfcTransaction.findMany({
    include: {
      member: { select: { name: true, mobile: true } },
      booking: {
        select: {
          sport: { select: { name: true } },
          turf: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // 4. Fetch active memberships
  const memberships = await prisma.memberMembership.findMany({
    where: { status: "ACTIVE" },
    include: {
      member: { select: { name: true, mobile: true } },
      membershipPlan: { select: { name: true, slotsPerDay: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  // 5. Fetch today's attendances
  const attendances = await prisma.attendance.findMany({
    where: {
      date: { gte: startOfToday, lte: endOfToday },
    },
    include: {
      member: { select: { name: true } },
      membershipPlan: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // 6. Aggregate counts
  const totalCards = await prisma.nfcCard.count();
  const activeCards = await prisma.nfcCard.count({ where: { status: "ACTIVE" } });
  const blockedCards = await prisma.nfcCard.count({
    where: { status: { in: ["BLOCKED", "SUSPENDED"] } },
  });
  const totalTxCount = await prisma.nfcTransaction.count();

  return (
    <NfcSimulatorClient
      initialCards={JSON.parse(JSON.stringify(cards))}
      initialBookings={JSON.parse(JSON.stringify(bookings))}
      initialTransactions={JSON.parse(JSON.stringify(transactions))}
      initialMemberships={JSON.parse(JSON.stringify(memberships))}
      initialAttendances={JSON.parse(JSON.stringify(attendances))}
      stats={{
        totalCards,
        activeCards,
        blockedCards,
        totalTxCount,
      }}
    />
  );
}
