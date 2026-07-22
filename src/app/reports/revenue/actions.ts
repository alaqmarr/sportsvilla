'use server'

import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export async function fetchRevenueData() {
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(new Date(), 29)); // Last 30 days

  const payments = await prisma.payment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  const walletTx = await prisma.walletTransaction.findMany({
    where: {
      type: "CREDIT",
      createdAt: {
        gte: startDate,
        lte: endDate,
      }
    }
  });

  // Aggregate by day
  const dailyData: Record<string, { date: string; cash: number; online: number; wallet: number }> = {};
  
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const dateStr = formatInTimeZone(d, 'Asia/Kolkata', 'MMM dd');
    dailyData[dateStr] = { date: dateStr, cash: 0, online: 0, wallet: 0 };
  }

  payments.forEach(p => {
    const dateStr = formatInTimeZone(new Date(p.createdAt), 'Asia/Kolkata', 'MMM dd');
    if (dailyData[dateStr]) {
      if (p.method === 'CASH') dailyData[dateStr].cash += p.amount;
      else dailyData[dateStr].online += p.amount;
    }
  });

  walletTx.forEach(w => {
    const dateStr = formatInTimeZone(new Date(w.createdAt), 'Asia/Kolkata', 'MMM dd');
    if (dailyData[dateStr]) {
      dailyData[dateStr].wallet += w.amount;
    }
  });

  // Calculate totals for Pie Chart
  let totalCash = 0;
  let totalOnline = 0;
  let totalWallet = 0;

  const chartData = Object.values(dailyData);
  chartData.forEach(d => {
    totalCash += d.cash;
    totalOnline += d.online;
    totalWallet += d.wallet;
  });

  return {
    chartData,
    pieData: [
      { name: 'Cash', value: totalCash },
      { name: 'Online', value: totalOnline },
      { name: 'Wallet Recharges', value: totalWallet }
    ],
    totals: {
      cash: totalCash,
      online: totalOnline,
      wallet: totalWallet,
      total: totalCash + totalOnline + totalWallet
    }
  };
}
