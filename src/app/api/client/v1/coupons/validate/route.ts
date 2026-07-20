import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/coupons/validate called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  const { member } = authRes;

  try {
    const { code, bookingAmount } = await request.json();

    if (!code || bookingAmount === undefined) {
      return jsonResponse({ error: 'Missing code or bookingAmount' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usages: { select: { id: true, memberId: true } },
        assignments: { select: { memberId: true } }
      }
    });

    if (!coupon || !coupon.isActive) {
      return jsonResponse({ error: 'Invalid or inactive coupon code.' }, { status: 400 });
    }

    // Expiry check
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return jsonResponse({ error: 'This coupon has expired.' }, { status: 400 });
    }

    // Global limit check
    if (coupon.maxUses !== null && coupon.usages.length >= coupon.maxUses) {
      return jsonResponse({ error: 'This coupon has reached its maximum usage limit.' }, { status: 400 });
    }

    // Per-user limit check
    if (coupon.maxUsesPerUser !== null) {
      const userUsages = coupon.usages.filter(u => u.memberId === member.id).length;
      if (userUsages >= coupon.maxUsesPerUser) {
        return jsonResponse({ error: `You can only use this coupon ${coupon.maxUsesPerUser} time(s).` }, { status: 400 });
      }
    }

    // Target Check
    if (coupon.targetType === 'SPECIFIC_MEMBERS') {
      const isAllowed = coupon.assignments.some(a => a.memberId === member.id);
      if (!isAllowed) {
        return jsonResponse({ error: 'This coupon is not valid for your account.' }, { status: 403 });
      }
    } else if (coupon.targetType === 'MILESTONE_ALL_TIME' || coupon.targetType === 'MILESTONE_FROM_CREATION') {
      const userBookings = await prisma.booking.count({
        where: { memberId: member.id, status: 'COMPLETED' }
      });
      if (userBookings < (coupon.milestoneBookingsCount || 0)) {
        return jsonResponse({ error: `Requires ${coupon.milestoneBookingsCount} completed bookings to unlock.` }, { status: 403 });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountAmount !== null) {
      discountAmount = coupon.discountAmount;
    } else if (coupon.discountPercentage !== null) {
      discountAmount = (bookingAmount * coupon.discountPercentage) / 100;
    }

    // Apply max discount cap
    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // Cap discount to booking amount (don't give negative balances)
    if (discountAmount > bookingAmount) {
      discountAmount = bookingAmount;
    }

    return jsonResponse({ 
      success: true, 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount: Math.floor(discountAmount)
      }
    });

  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/coupons/validate ->`, error);
    console.error('Coupon validation error:', error);
    return jsonResponse({ error: 'An unexpected error occurred while validating the coupon.' }, { status: 500 });
  }
}
