import { prisma } from "@/lib/prisma";
import { NfcSimulatorClient } from "./NfcSimulatorClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "NFC Hardware Simulator & QA Lab | SportsVilla Dev",
  description: "Interactive hardware test harness for NFC cards, keyboard wedge, and payment simulation.",
};

export default async function NfcSimulatorPage() {
  const session = await getServerSession(authOptions);
  const isDev = process.env.NODE_ENV !== "production";
  const isAuthenticatedAdmin = !!session?.user?.email;

  // Protect route in production: require admin session
  if (!isAuthenticatedAdmin && !isDev) {
    redirect("/login?callbackUrl=/dev/nfc-simulator");
  }

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

  // Protect customer PII if unauthenticated in local development
  const safeCards = isAuthenticatedAdmin
    ? cards
    : cards.map((c) => ({
        ...c,
        member: c.member
          ? {
              ...c.member,
              name: `Dev Member ${c.member.id.slice(-4)}`,
              mobile: "******" + (c.member.mobile ? c.member.mobile.slice(-4) : "0000"),
            }
          : null,
      }));

  const safeBookings = isAuthenticatedAdmin
    ? bookings
    : bookings.map((b) => ({
        ...b,
        member: b.member
          ? {
              ...b.member,
              name: `Dev Member ${b.member.id.slice(-4)}`,
              mobile: "******" + (b.member.mobile ? b.member.mobile.slice(-4) : "0000"),
            }
          : null,
      }));

  const safeTransactions = isAuthenticatedAdmin
    ? transactions
    : transactions.map((t) => ({
        ...t,
        member: t.member
          ? {
              ...t.member,
              name: "Dev Member",
              mobile: "******" + (t.member.mobile ? t.member.mobile.slice(-4) : "0000"),
            }
          : null,
      }));

  const safeMemberships = isAuthenticatedAdmin
    ? memberships
    : memberships.map((m) => ({
        ...m,
        member: m.member
          ? {
              ...m.member,
              name: "Dev Member",
              mobile: "******" + (m.member.mobile ? m.member.mobile.slice(-4) : "0000"),
            }
          : null,
      }));

  const safeAttendances = isAuthenticatedAdmin
    ? attendances
    : attendances.map((a) => ({
        ...a,
        member: a.member ? { ...a.member, name: "Dev Member" } : null,
      }));

  return (
    <NfcSimulatorClient
      initialCards={JSON.parse(JSON.stringify(safeCards))}
      initialBookings={JSON.parse(JSON.stringify(safeBookings))}
      initialTransactions={JSON.parse(JSON.stringify(safeTransactions))}
      initialMemberships={JSON.parse(JSON.stringify(safeMemberships))}
      initialAttendances={JSON.parse(JSON.stringify(safeAttendances))}
      stats={{
        totalCards,
        activeCards,
        blockedCards,
        totalTxCount,
      }}
    />
  );
}

