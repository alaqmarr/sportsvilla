import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/coupons/available called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  try {
    const availableCoupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ]
      },
      include: {
        assignments: { select: { memberId: true } }
      }
    });

    const applicableCoupons = [];

    for (const coupon of availableCoupons) {
      // 1. Visibility & Targeting check
      let isVisible = false;

      if (coupon.isPublic || coupon.targetType === 'EVERYONE') {
        isVisible = true; // Anyone can see public coupons or those meant for EVERYONE
      } else if (coupon.targetType === 'SPECIFIC_MEMBERS') {
        // If private, only see it if specifically assigned
        if (coupon.assignments.some(a => a.memberId === member.id)) {
          isVisible = true;
        }
      }

      if (!isVisible) continue;

      // 2. Global limit check
      if (coupon.maxUses !== null) {
        const globalUsages = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
        if (globalUsages >= coupon.maxUses) {
          continue;
        }
      }

      // 3. Per-user limit check
      if (coupon.maxUsesPerUser !== null) {
        const userUsages = await prisma.couponUsage.count({ where: { couponId: coupon.id, memberId: member.id } });
        if (userUsages >= coupon.maxUsesPerUser) {
          continue;
        }
      }

      // 4. Milestone Check (Optional, but good to hide if they haven't met it)
      if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
        const userBookings = await prisma.booking.count({
          where: { memberId: member.id, status: 'COMPLETED' }
        });
        if (userBookings < (coupon.milestoneBookingsCount || 0)) {
          continue; // Don't show if they haven't unlocked it yet
        }
      }

      // If all checks pass, we add it to the list
      applicableCoupons.push({
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountPercentage: coupon.discountPercentage,
        maxDiscount: coupon.maxDiscount,
        targetType: coupon.targetType,
        expiryDate: coupon.expiryDate,
      });
    }

    return jsonResponse({ success: true, coupons: applicableCoupons });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/coupons/available ->`, error);
    console.error('Fetch available coupons error:', error);
    return jsonResponse({ error: 'Failed to load available coupons' }, { status: 500 });
  }
}
