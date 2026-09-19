import { prisma } from "@/core/database/prisma";

export async function fetchLeaderboardCore(limit: number = 100) {
  return await prisma.member.findMany({
    orderBy: { loyaltyPoints: "desc" },
    take: limit,
  });
}
