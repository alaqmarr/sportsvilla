import { prisma } from "@/core/database/prisma";
import { formatInTimeZone } from "date-fns-tz";
import { getISTDateRange } from "@/core/utils/dateUtils";

export async function fetchAdvancedAttendanceCore(
  startDateStr: string,
  endDateStr: string,
  startTimeStr: string = "00:00",
  endTimeStr: string = "23:59",
  planId?: string
) {
  try {
    const startDate = new Date(`${startDateStr}T${startTimeStr}:00`);
    const endDate = new Date(`${endDateStr}T${endTimeStr}:59.999`);

    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (planId && planId !== "all") {
      whereClause.membershipPlanId = planId;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        member: true,
        membershipPlan: {
          include: {
            sport: true,
          },
        },
        sport: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return attendances;
  } catch (error) {
    console.error("Failed to fetch advanced attendance", error);
    throw new Error("Failed to fetch attendance reports");
  }
}

export async function fetchAttendanceReportCore(mobile: string) {
  return await prisma.member.findMany({
    where: { mobile },
    include: {
      memberships: {
        include: {
          membershipPlan: {
            include: { sport: true },
          },
        },
        orderBy: {
          startDate: "desc",
        },
      },
      attendances: {
        include: {
          sport: true,
          membershipPlan: true,
        },
        orderBy: {
          date: "desc",
        },
      },
    },
  });
}

export async function fetchMembershipDetailCore(id: string) {
  try {
    const membership = await prisma.memberMembership.findUnique({
      where: { id },
      include: {
        member: {
          include: {
            attendances: {
              include: {
                sport: true,
                membershipPlan: true,
              },
            },
          },
        },
        membershipPlan: {
          include: { sport: true },
        },
      },
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

export async function fetchMembershipReportsCore(
  startDateStr: string,
  endDateStr: string
) {
  try {
    const start = new Date(`${startDateStr}T00:00:00`);
    const end = new Date(`${endDateStr}T23:59:59.999`);

    // Overlap condition: membership starts before the period ends, and ends after the period starts
    const memberships = await prisma.memberMembership.findMany({
      where: {
        startDate: { lte: end },
        endDate: { gte: start },
      },
      include: {
        member: {
          include: {
            attendances: {
              where: {
                date: {
                  gte: start,
                  lte: end,
                },
              },
            },
            memberships: true,
          },
        },
        membershipPlan: {
          include: { sport: true },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return memberships;
  } catch (error) {
    console.error("Failed to fetch membership reports", error);
    throw new Error("Failed to fetch membership reports");
  }
}

export async function fetchRevenueDataCore() {
  const { start: startDate, end: endDate } = getISTDateRange(29); // Last 30 days including today

  const payments = await prisma.payment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      booking: {
        status: { not: "CANCELLED" },
      },
    },
  });

  const walletTx = await prisma.walletTransaction.findMany({
    where: {
      type: "CREDIT",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const rechargeCredits = walletTx.filter(
    (w) => !/refund|cancelled/i.test(w.description || "")
  );

  // Aggregate by day
  const dailyData: Record<
    string,
    { date: string; cash: number; online: number; wallet: number }
  > = {};

  for (let i = 29; i >= 0; i--) {
    const d = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatInTimeZone(d, "Asia/Kolkata", "MMM dd");
    dailyData[dateStr] = { date: dateStr, cash: 0, online: 0, wallet: 0 };
  }

  payments.forEach((p) => {
    const dateStr = formatInTimeZone(
      new Date(p.createdAt),
      "Asia/Kolkata",
      "MMM dd"
    );
    if (dailyData[dateStr]) {
      if (p.method === "CASH") dailyData[dateStr].cash += p.amount;
      else if (p.method === "ONLINE") dailyData[dateStr].online += p.amount;
    }
  });

  rechargeCredits.forEach((w) => {
    const dateStr = formatInTimeZone(
      new Date(w.createdAt),
      "Asia/Kolkata",
      "MMM dd"
    );
    if (dailyData[dateStr]) {
      dailyData[dateStr].wallet += w.amount / 100;
    }
  });

  // Calculate totals for Pie Chart
  let totalCash = 0;
  let totalOnline = 0;
  let totalWallet = 0;

  const chartData = Object.values(dailyData);
  chartData.forEach((d) => {
    totalCash += d.cash;
    totalOnline += d.online;
    totalWallet += d.wallet;
  });

  return {
    chartData,
    pieData: [
      { name: "Cash", value: totalCash },
      { name: "Online", value: totalOnline },
      { name: "Wallet Recharges", value: totalWallet },
    ],
    totals: {
      cash: totalCash,
      online: totalOnline,
      wallet: totalWallet,
      total: totalCash + totalOnline + totalWallet,
    },
  };
}
