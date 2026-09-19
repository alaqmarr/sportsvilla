import { prisma } from "@/core/database/prisma";
import { getISTDateBounds } from "@/core/utils/dateUtils";
import { NfcTransactionFilter, NfcTransactionStats } from "@/types/nfc";

export async function getNfcStatsCore(): Promise<NfcTransactionStats> {
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

export async function getNfcTransactionsCore(filters: NfcTransactionFilter = {}) {
  const where: any = {};

  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

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
    getNfcStatsCore(),
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
