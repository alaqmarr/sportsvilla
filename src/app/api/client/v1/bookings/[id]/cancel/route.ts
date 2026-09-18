import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { bumpSyncTimestamp } from '@/lib/sync';
import { sendWhatsAppBookingCancelledTemplate } from "@/lib/whatsapp";
import { BookingService } from '@/services/BookingService';
import { sendWalletTransactionPush } from '@/lib/notifications';
import { logger } from '@/lib/logger';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] POST /api/client/v1/bookings/[id]/cancel called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { payments: true, member: true, turf: true }
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
    
    const preview = BookingService.getRefundPreview(booking as any, limitHours);
    const penaltyRupees = preview.penalty;
    const actualRefundRupees = preview.refund;
    const refundAmountPaise = Math.round(actualRefundRupees * 100);

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

    // Execute everything in a single transaction
    await prisma.$transaction(async (tx) => {
      // FIX #5: Check if it's already cancelled inside the transaction
      const txBooking = await tx.booking.findUnique({ where: { id: params.id } });
      if (!txBooking || txBooking.status === 'CANCELLED') {
        throw new Error("Booking is already cancelled or doesn't exist");
      }

      // Cancel the booking
      await tx.booking.update({
        where: { id: params.id },
        data: { status: "CANCELLED" }
      });

      // B22: Cancel tickets and participants so cancelled bookings cannot be used for entry
      await tx.ticket.updateMany({
        where: { bookingId: params.id },
        data: { status: 'CANCELLED' }
      });
      await tx.bookingParticipant.updateMany({
        where: { bookingId: params.id },
        data: { status: 'CANCELLED' }
      });

      // B22: In wallet refund, ensure refund is credited to booking.memberId, not an arbitrary caller
      if (refundAmountPaise > 0) {
        await tx.member.update({
          where: { id: booking.memberId },
          data: { walletBalance: { increment: refundAmountPaise } }
        });
        await tx.walletTransaction.create({
          data: {
            memberId: booking.memberId,
            amount: refundAmountPaise,
            type: 'CREDIT',
            description: `Refund for cancelled booking ${booking.id}`
          }
        });
      }

      // Reverse loyalty points from whoever earned them
      if (pointsToReverse > 0 && pointsEarnerId) {
        const earner = await tx.member.findUnique({ where: { id: pointsEarnerId } });
        const actualPointsToReverse = Math.min(pointsToReverse, earner?.loyaltyPoints || 0);
        if (actualPointsToReverse > 0) {
          await tx.member.update({
            where: { id: pointsEarnerId },
            data: { loyaltyPoints: { decrement: actualPointsToReverse } }
          });
          await tx.loyaltyHistory.create({
            data: {
              memberId: pointsEarnerId,
              points: actualPointsToReverse,
              type: 'REDEEMED', // used as reversal
              source: 'MANUAL',
              description: `Reversed for cancelled booking ${booking.id}`
            }
          });
        }
      }

      // B22: Restore booking.pointsRedeemed to member loyalty points if points were redeemed on booking creation
      if (booking.pointsRedeemed && booking.pointsRedeemed > 0) {
        await tx.member.update({
          where: { id: booking.memberId },
          data: { loyaltyPoints: { increment: booking.pointsRedeemed } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: booking.memberId,
            points: booking.pointsRedeemed,
            type: 'EARNED',
            source: 'MANUAL',
            description: `Refund redeemed points for cancelled booking ${booking.id}`
          }
        });
      }
      
      // Update UserSportStat (decrease booking count for the target member since it was cancelled)
      await tx.userSportStat.updateMany({
        where: { memberId: booking.memberId, sportId: booking.sportId, bookingCount: { gt: 0 } },
        data: { bookingCount: { decrement: 1 } }
      });

      // Bug #7: Delete CouponUsage so the coupon slot is freed up
      await tx.couponUsage.deleteMany({
        where: { bookingId: booking.id }
      });
    });

    if (booking.member.mobile) {
      try {
        const formattedTime = new Date(booking.startTime).toLocaleTimeString('en-IN', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short'
        });
        
        await sendWhatsAppBookingCancelledTemplate(
          booking.member.name,
          booking.turf.name,
          formattedTime,
          refundAmountPaise / 100,
          booking.member.mobile
        );
      } catch (waErr) {
        console.error("Failed to send booking cancelled WhatsApp template:", waErr);
      }
    }

    if (refundAmountPaise > 0) {
      sendWalletTransactionPush(
        booking.memberId,
        refundAmountPaise / 100,
        'CREDIT',
        `Refund for cancelled booking ${booking.id}`
      ).catch((err) => {
        logger.error('[Push Hook Error] User booking cancel refund push failed', err);
      });
    }

    await bumpSyncTimestamp('booking_cancel');
    return jsonResponse({ success: true, message: "Booking cancelled successfully and amount refunded to wallet." });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/bookings/[id]/cancel ->`, error);
    return jsonResponse({ success: false, error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
