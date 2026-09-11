"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { getISTDateBounds, getISTDateRange } from "@/lib/dateUtils";
import { NfcTransactionFilter, NfcTransactionStats } from "@/types/nfc";

async function verifyAdminPermission() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please log in");
  }

  const admin = await prisma.admin.findFirst({
    where: { email: session.user.email },
  });

  if (!admin || !admin.isActive) {
    throw new Error("Unauthorized: Active admin account required");
  }

  if (admin.role !== "SUPERADMIN" && !hasPermission(admin, "view:nfc")) {
    throw new Error("Forbidden: Missing view:nfc permission");
  }

  return admin;
}

/**
 * Computes global KPI metrics for NFC taps and transactions.
 */
export async function getNfcStats(): Promise<NfcTransactionStats> {
  const todayBounds = getISTDateBounds();

  const [totalTaps, successfulTaps, failedTaps, volumeResult, todayTaps] = await Promise.all([
    prisma.nfcTransaction.count(),
    prisma.nfcTransaction.count({ where: { status: "SUCCESS" } }),
    prisma.nfcTransaction.count({ where: { status: "FAILED" } }),
    prisma.nfcTransaction.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.nfcTransaction.count({
      where: {
        createdAt: {
          gte: todayBounds.start,
          lte: todayBounds.end,
        },
      },
    }),
  ]);

  return {
    totalTaps,
    successfulTaps,
    failedTaps,
    totalVolumeRupees: volumeResult._sum.amount || 0,
    todayTaps,
  };
}

/**
 * Retrieves NFC transactions ledger with filtering and pagination.
 */
export async function getNfcTransactions(filters: NfcTransactionFilter = {}) {
  await verifyAdminPermission();

  const where: any = {};

  // Date range filter
  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  // Type filter
  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }

  // Status filter
  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  // Query filter (matches Card UID, Member Name, Mobile, or Location)
  if (filters.query && filters.query.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { cardUid: { contains: q } },
      { readerLocation: { contains: q } },
      {
        member: {
          OR: [{ name: { contains: q } }, { mobile: { contains: q } }],
        },
      },
    ];
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 50;
  const skip = (page - 1) * pageSize;

  const [transactions, totalCount, stats] = await Promise.all([
    prisma.nfcTransaction.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            mobile: true,
            walletBalance: true,
          },
        },
        card: {
          select: {
            id: true,
            cardUid: true,
            cardId: true,
            status: true,
          },
        },
        booking: {
          select: {
            id: true,
            price: true,
            paymentStatus: true,
            turf: { select: { name: true } },
            sport: { select: { name: true } },
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.nfcTransaction.count({ where }),
    getNfcStats(),
  ]);

  return {
    transactions,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    stats,
  };
}
