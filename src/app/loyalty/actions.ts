"use server";
import { prisma } from "@/lib/prisma";

export async function fetchLeaderboard() {
  const members = await prisma.member.findMany({
    orderBy: { loyaltyPoints: 'desc' },
    take: 100, // Top 100
  });
  return members;
}
