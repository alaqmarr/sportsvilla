import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/coupons called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const now = new Date();
    
    // Fetch all active, valid public coupons OR coupons specifically assigned to the member
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: now } }
        ],
        AND: [
          {
            OR: [
              { isPublic: true },
              { targetType: 'EVERYONE' },
              { assignments: { some: { memberId: member.id } } },
              { targetType: 'MILESTONE_ALL_TIME' },
              { targetType: 'MILESTONE_FROM_CREATION' }
            ]
          }
        ]
      },
      include: {
        assignments: true,
        _count: {
          select: { usages: true }
        },
        usages: {
          where: { memberId: member.id }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter out coupons that exceed usage limits or milestone constraints
    const memberData = await prisma.member.findUnique({ where: { id: member.id } });
    
    const validCoupons = [];
    
    for (const coupon of coupons) {
      // Check total max uses
      if (coupon.maxUses && coupon._count.usages >= coupon.maxUses) {
        continue;
      }
      
      // Check per-user max uses
      if (coupon.maxUsesPerUser && coupon.usages.length >= coupon.maxUsesPerUser) {
        continue;
      }

      // Check milestones
      if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
        const milestoneWhere: any = { 
          memberId: member.id, 
          status: { in: ['CONFIRMED', 'COMPLETED'] } 
        };
        if (coupon.targetType === 'MILESTONE_FROM_CREATION' && memberData?.joinDate) {
          milestoneWhere.createdAt = { gte: memberData.joinDate };
        }
        const userBookingsCount = await prisma.booking.count({ where: milestoneWhere });
        if (userBookingsCount < (coupon.milestoneBookingsCount || 0)) {
          continue; // Milestone not reached
        }
      }
      
      validCoupons.push({
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountPercentage: coupon.discountPercentage,
        maxDiscount: coupon.maxDiscount,
        targetType: coupon.targetType,
        expiryDate: coupon.expiryDate
      });
    }

    return jsonResponse({ 
      success: true, 
      coupons: validCoupons 
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/coupons ->`, error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
