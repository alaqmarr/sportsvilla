import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/offers called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member } = authRes;
  const { searchParams } = new URL(request.url);
  const requestedMemberId = searchParams.get('memberId');
  
  let targetMemberId = member.id;
  if (requestedMemberId && requestedMemberId !== member.id) {
    const familyCheck = await prisma.member.findFirst({
      where: { id: requestedMemberId, mobile: member.mobile }
    });
    if (familyCheck) {
      targetMemberId = requestedMemberId;
    }
  }

  try {
    // 1. Fetch public coupons and include usages for this member
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        isPublic: true
      },
      include: {
        usages: {
          where: {
            memberId: targetMemberId
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch active app announcements
    const announcements = await prisma.appAnnouncement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch loyalty triggers and member's progress
    const userBookings = await prisma.booking.count({
      where: {
        memberId: targetMemberId,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      }
    });

    const triggers = await prisma.loyaltyTrigger.findMany({
      where: { isActive: true },
      orderBy: { targetBookingsCount: 'asc' }
    });

    const achievements = await prisma.loyaltyAchievement.findMany({
      where: { memberId: targetMemberId },
      select: { triggerId: true, achievedAt: true }
    });
    
    const achievedTriggerIds = new Set(achievements.map(a => a.triggerId));

    const enhancedTriggers = triggers.map(t => ({
      ...t,
      isAchieved: achievedTriggerIds.has(t.id),
      progress: Math.min(userBookings, t.targetBookingsCount)
    }));

    return jsonResponse({
      success: true,
      coupons,
      announcements,
      loyaltyTriggers: enhancedTriggers,
      userBookings
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/offers ->`, error);
    console.error("Offers API Error:", error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
