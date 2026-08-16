import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/leaderboard called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member: primaryMember } = authRes;

  try {
    // 1. Fetch top 50 members sorted by loyalty points descending
    const topMembers = await prisma.member.findMany({
      orderBy: { loyaltyPoints: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        loyaltyPoints: true
      }
    });

    // 2. Add an explicit rank based on their points compared to the highest score
    // or just sequential rank if we assume no ties, but for fairness we can assign rank based on position.
    let currentRank = 1;
    const rankedMembers = topMembers.map((m, index) => {
      if (index > 0 && m.loyaltyPoints < topMembers[index - 1].loyaltyPoints) {
        currentRank = index + 1;
      }
      return { ...m, rank: currentRank };
    });

    // 3. Find the rank of the logged-in primary member
    // To do this accurately across the entire DB: count how many members have strictly MORE points.
    const userPoints = primaryMember.loyaltyPoints || 0;
    const membersWithMorePoints = await prisma.member.count({
      where: {
        loyaltyPoints: { gt: userPoints }
      }
    });
    const userRank = membersWithMorePoints + 1;

    return jsonResponse({ 
      success: true, 
      topMembers: rankedMembers, 
      userRank, 
      userPoints,
      primaryMemberId: primaryMember.id
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/leaderboard ->`, error);
    console.error('Leaderboard fetch error:', error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
