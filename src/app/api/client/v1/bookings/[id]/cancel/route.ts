import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse } from '@/lib/api-logger';
import { bumpSyncTimestamp } from '@/lib/sync';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  console.log(`[API] POST /api/client/v1/bookings/[id]/cancel called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { payments: true }
    });

    if (!booking) {
      return jsonResponse({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Bug #14: Allow family members (same mobile) to cancel each other's bookings
    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: { id: true }
    });
    const familyIds = familyMembers.map(m => m.id);
    if (!familyIds.includes(booking.memberId)) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return jsonResponse({ success: false, error: "Booking is already cancelled" }, { status: 400 });
    }

    // Bug #5: Always block past/started bookings regardless of limitHours
    const now = new Date();
    if (booking.startTime <= now) {
      return jsonResponse({ success: false, error: "Cannot cancel a booking that has already started or is in the past." }, { status: 400 });
    }

    // Check global settings
    const globalSettings = await prisma.setting.findMany();
    const settingsMap = globalSettings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);
    
    const allowCancellation = settingsMap.ALLOW_CANCELLATION !== "false";
    if (!allowCancellation) {
      return jsonResponse({ success: false, error: 'Cancellation is currently disabled by the administrator.' }, { status: 403 });
    }
    
    const limitHours = parseInt(settingsMap.CLIENT_CANCELLATION_LIMIT_HOURS || "3", 10);
    
    if (limitHours > 0) {
      const diffMs = booking.startTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours < limitHours) {
        return jsonResponse({ success: false, error: `You can only cancel bookings at least ${limitHours} hours before the start time.` }, { status: 400 });
      }
    }

    // Bug #4: Use advancePaid directly for refund, not payments sum
    // Convert to paise as walletBalance is in paise
    const refundAmountPaise = booking.advancePaid ? booking.advancePaid * 100 : 0;

    // Bug #3: Calculate loyalty points to reverse
    const loyaltyToReverse = await prisma.loyaltyHistory.findFirst({
      where: {
        source: 'BOOKING',
        description: { contains: booking.id },
        type: 'EARNED'
      }
    });
    const pointsToReverse = loyaltyToReverse?.points || 0;
    const pointsEarnerId = loyaltyToReverse?.memberId;

    // Find original payer from wallet transactions
    const walletDebit = await prisma.walletTransaction.findFirst({
      where: {
        description: { contains: booking.id },
        type: 'DEBIT'
      }
    });
    const originalPayerId = walletDebit?.memberId || member.id; // fallback to active user

    // Execute everything in a single transaction
    await prisma.$transaction(async (tx) => {
      // Cancel the booking
      await tx.booking.update({
        where: { id: params.id },
        data: { status: "CANCELLED" }
      });

      // Refund wallet to original payer
      if (refundAmountPaise > 0) {
        await tx.member.update({
          where: { id: originalPayerId },
          data: { walletBalance: { increment: refundAmountPaise } }
        });
        await tx.walletTransaction.create({
          data: {
            memberId: originalPayerId,
            amount: refundAmountPaise,
            type: 'CREDIT',
            description: `Refund for cancelled booking ${booking.id}`
          }
        });
      }

      // Reverse loyalty points from whoever earned them
      if (pointsToReverse > 0 && pointsEarnerId) {
        await tx.member.update({
          where: { id: pointsEarnerId },
          data: { loyaltyPoints: { decrement: pointsToReverse } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: pointsEarnerId,
            points: pointsToReverse,
            type: 'REDEEMED', // used as reversal
            source: 'MANUAL',
            description: `Reversed for cancelled booking ${booking.id}`
          }
        });
      }

      // We don't currently support redeeming points in booking, 
      // but if we did, we would reverse it here based on original redeemer.
      
      // Update UserSportStat (decrease booking count for the target member since it was cancelled)
      await tx.userSportStat.updateMany({
        where: { memberId: booking.memberId, sportId: booking.sportId, bookingCount: { gt: 0 } },
        data: { bookingCount: { decrement: 1 } }
      });
    });

      // Bug #7: Delete CouponUsage so the coupon slot is freed up
      await tx.couponUsage.deleteMany({
        where: { bookingId: booking.id }
      });

      // Update UserSportStat
      await tx.userSportStat.updateMany({
        where: { memberId: booking.memberId, sportId: booking.sportId },
        data: { bookingCount: { decrement: 1 } }
      });
    });

    await bumpSyncTimestamp('booking_cancel');
    return jsonResponse({ success: true, message: "Booking cancelled successfully and amount refunded to wallet." });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/bookings/[id]/cancel ->`, error);
    return jsonResponse({ success: false, error: error.message }, { status: 500 });
  }
}
