import { prisma } from '@/core/database/prisma';
import { ApiError } from '@/core/http/api-handler';
import { logger } from '@/core/logging/logger';
import { BookingCleanupService } from '@/modules/bookings/bookings.services';
import { randomUUID } from 'crypto';
import { eventBus, WalletCreditedEvent } from '@/core/events';

export interface SettlePaymentParams {
  bookingId: string;
  gateway: 'RAZORPAY' | 'PHONEPE' | 'WALLET' | 'MANUAL';
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  gatewaySignature?: string | null;
  paidAmountRupees: number;
  metadata?: Record<string, unknown>;
}

export interface SettlePaymentResult {
  success: boolean;
  status: 'PAID' | 'PARTIAL' | 'ALREADY_PAID' | 'OVERBOOKED_REFUNDED';
  message?: string;
  booking?: any;
}

/**
 * Atomically verifies slot capacity before confirming a booking on payment callback.
 * If slot was claimed or booking was cancelled, auto-refunds the payment to the member's wallet.
 */
export async function settleSuccessfulPayment(params: SettlePaymentParams): Promise<SettlePaymentResult> {
  let pendingRefundEvent: WalletCreditedEvent | null = null;

  const result: SettlePaymentResult = await prisma.$transaction(async (tx): Promise<SettlePaymentResult> => {
    const booking = await tx.booking.findUnique({
      where: { id: params.bookingId },
      include: { turf: true, sport: true, member: true, couponUsages: { include: { coupon: true } } }
    });

    if (!booking) {
      throw new ApiError('Booking not found', 404);
    }

    // 1. Idempotency check: Booking already settled
    if (booking.paymentStatus === 'PAID') {
      logger.info('Payment already settled for booking', { bookingId: booking.id });

      // Update any matching PENDING transaction so it doesn't remain stranded
      if (params.gatewayOrderId) {
        const pendingTransactions = await tx.transaction.findMany({
          where: {
            gatewayOrderId: params.gatewayOrderId,
            status: 'PENDING'
          }
        });

        for (const pendingTx of pendingTransactions) {
          let existingMeta: Record<string, unknown> = {};
          try {
            existingMeta = JSON.parse(pendingTx.metadata || '{}');
          } catch {
            existingMeta = {};
          }

          await tx.transaction.update({
            where: { id: pendingTx.id },
            data: {
              status: 'SUCCESS',
              gatewayPaymentId: params.gatewayPaymentId || pendingTx.gatewayPaymentId,
              gatewaySignature: params.gatewaySignature || pendingTx.gatewaySignature,
              errorMessage: null,
              metadata: JSON.stringify({
                ...existingMeta,
                verifiedAt: new Date().toISOString(),
                note: 'Settled via concurrent request (idempotent)',
                ...params.metadata
              })
            }
          });
        }
      }

      return { success: true, status: 'ALREADY_PAID', booking };
    }

    // 2. Check if booking was previously marked CANCELLED by auto-cleanup
    const isAlreadyCancelled = booking.status === 'CANCELLED';

    // 3. Verify turf slot capacity
    const overlapping = await tx.booking.findMany({
      where: {
        turfId: booking.turfId,
        id: { not: booking.id },
        status: { not: 'CANCELLED' },
        startTime: { lt: booking.endTime },
        endTime: { gt: booking.startTime },
        OR: [
          { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          {
            status: 'PAYMENT_PENDING',
            createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) }
          }
        ]
      }
    });

    const usedCapacity = overlapping.reduce((sum, b) => sum + (b.participantCount || 1), 0);
    const capacityAvailable = (booking.turf.capacityPerSlot - usedCapacity) >= (booking.participantCount || 1);

    // ------------------------------------------------------------------------
    // CASE A: OVERBOOKED OR CANCELLED -> AUTO-REFUND TO MEMBER WALLET
    // ------------------------------------------------------------------------
    if (isAlreadyCancelled || !capacityAvailable) {
      logger.warn('Late payment received for overbooked or cancelled slot. Executing auto-refund to wallet.', {
        bookingId: booking.id,
        isAlreadyCancelled,
        capacityAvailable,
        usedCapacity,
        capacityPerSlot: booking.turf.capacityPerSlot
      });

      // If booking was still PAYMENT_PENDING, initial advance was not yet refunded.
      // If booking was CANCELLED, initial advance was already refunded by cleanup.
      const initialAdvanceToRefund = isAlreadyCancelled ? 0 : booking.advancePaid;
      const totalRefundRupees = initialAdvanceToRefund + params.paidAmountRupees;
      const refundPaise = Math.round(totalRefundRupees * 100);

      // Credit full refund to member's wallet balance
      await tx.member.update({
        where: { id: booking.memberId },
        data: { walletBalance: { increment: refundPaise } }
      });

      // Record wallet transaction
      await tx.walletTransaction.create({
        data: {
          memberId: booking.memberId,
          amount: refundPaise,
          type: 'CREDIT',
          description: `Auto-refund: Slot no longer available for booking #${booking.id}`
        }
      });

      // Ensure booking is marked CANCELLED
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'UNPAID',
          amountDue: booking.price,
          advancePaid: 0
        }
      });

      // Log transaction with SUCCESS status but metadata indicating wallet refund
      const existingTx = params.gatewayOrderId
        ? await tx.transaction.findFirst({
            where: { gatewayOrderId: params.gatewayOrderId, gateway: params.gateway }
          })
        : null;

      if (existingTx) {
        await tx.transaction.update({
          where: { id: existingTx.id },
          data: {
            status: 'SUCCESS',
            gatewayPaymentId: params.gatewayPaymentId || existingTx.gatewayPaymentId,
            gatewaySignature: params.gatewaySignature || existingTx.gatewaySignature,
            errorMessage: 'Slot claimed before payment completed. Auto-refunded to wallet.',
            metadata: JSON.stringify({
              ...JSON.parse(existingTx.metadata || '{}'),
              action: 'OVERBOOKED_WALLET_REFUND',
              refundPaise,
              reason: isAlreadyCancelled ? 'BOOKING_CANCELLED' : 'SLOT_UNAVAILABLE',
              ...params.metadata
            })
          }
        });
      } else {
        await tx.transaction.create({
          data: {
            bookingId: booking.id,
            memberId: booking.memberId,
            gateway: params.gateway,
            gatewayOrderId: params.gatewayOrderId || null,
            gatewayPaymentId: params.gatewayPaymentId || null,
            gatewaySignature: params.gatewaySignature || null,
            amount: params.paidAmountRupees,
            currency: 'INR',
            status: 'SUCCESS',
            errorMessage: 'Slot claimed before payment completed. Auto-refunded to wallet.',
            metadata: JSON.stringify({
              action: 'OVERBOOKED_WALLET_REFUND',
              refundPaise,
              reason: isAlreadyCancelled ? 'BOOKING_CANCELLED' : 'SLOT_UNAVAILABLE',
              ...params.metadata
            })
          }
        });
      }

      pendingRefundEvent = {
        memberId: booking.memberId,
        memberName: booking.member?.name,
        rechargeAmount: totalRefundRupees,
        mobile: booking.member?.mobile,
        description: 'Refund: Slot claimed or booking cancelled',
        reason: 'REFUND',
        bookingId: booking.id,
      };

      return {
        success: false,
        status: 'OVERBOOKED_REFUNDED',
        message: 'The slot was claimed before payment completed. The payment has been automatically credited to your wallet.'
      };
    }

    // ------------------------------------------------------------------------
    // CASE B: CAPACITY AVAILABLE -> CONFIRM BOOKING & RECORD PAYMENT
    // ------------------------------------------------------------------------
    const totalAdvancePaid = (booking.advancePaid || 0) + params.paidAmountRupees;
    const netTargetPrice = Math.max(0, booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0));
    const isFullPayment = totalAdvancePaid >= netTargetPrice;
    const paymentStatus: 'PAID' | 'PARTIAL' = isFullPayment ? 'PAID' : 'PARTIAL';
    const amountDue = isFullPayment ? 0 : Math.max(0, netTargetPrice - totalAdvancePaid);

    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus,
        amountDue,
        advancePaid: { increment: params.paidAmountRupees }
      },
      include: { turf: true, sport: true, member: true, couponUsages: { include: { coupon: true } } }
    });

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        amount: params.paidAmountRupees,
        method: 'ONLINE'
      }
    });

    // Award loyalty points upon successful full payment settlement
    if (paymentStatus === 'PAID') {
      const pointsEarned = Math.floor(
        Math.max(0, booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0)) * 0.01
      );

      if (pointsEarned > 0) {
        await tx.member.update({
          where: { id: booking.memberId },
          data: { loyaltyPoints: { increment: pointsEarned } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: booking.memberId,
            points: pointsEarned,
            type: 'EARNED',
            source: 'BOOKING',
            description: `Earned from booking ${booking.id}`
          }
        });
      }
    }

    // Update or create Transaction record
    const existingTx = params.gatewayOrderId
      ? await tx.transaction.findFirst({
          where: { gatewayOrderId: params.gatewayOrderId, gateway: params.gateway }
        })
      : null;

    if (existingTx) {
      await tx.transaction.update({
        where: { id: existingTx.id },
        data: {
          status: 'SUCCESS',
          gatewayPaymentId: params.gatewayPaymentId || existingTx.gatewayPaymentId,
          gatewaySignature: params.gatewaySignature || existingTx.gatewaySignature,
          errorMessage: null,
          metadata: JSON.stringify({
            ...JSON.parse(existingTx.metadata || '{}'),
            verifiedAt: new Date().toISOString(),
            ...params.metadata
          })
        }
      });
    } else {
      await tx.transaction.create({
        data: {
          bookingId: booking.id,
          memberId: booking.memberId,
          gateway: params.gateway,
          gatewayOrderId: params.gatewayOrderId || null,
          gatewayPaymentId: params.gatewayPaymentId || null,
          gatewaySignature: params.gatewaySignature || null,
          amount: params.paidAmountRupees,
          currency: 'INR',
          status: 'SUCCESS',
          metadata: JSON.stringify({
            verifiedAt: new Date().toISOString(),
            ...params.metadata
          })
        }
      });
    }

    return { success: true, status: paymentStatus, booking: updatedBooking };
  });

  if (pendingRefundEvent) {
    eventBus.emit('wallet.credited', pendingRefundEvent);
  }

  return result;
}

/**
 * Helper to ensure tickets and WhatsApp notifications are sent on confirmed payment.
 */
export async function sendConfirmationAndTickets(booking: any) {
  try {
    if (!booking) return;

    // Generate tickets if not already present
    const existingTickets = await prisma.ticket.count({ where: { bookingId: booking.id } });
    if (existingTickets === 0) {
      const ticketsData = [];
      for (let i = 0; i < (booking.participantCount || 1); i++) {
        ticketsData.push({
          bookingId: booking.id,
          qrCode: `TICKET-${randomUUID()}`,
        });
      }
      await prisma.ticket.createMany({ data: ticketsData });
    }

    let turfData = booking.turf;
    let sportData = booking.sport;
    if (!turfData && booking.turfId) {
      turfData = await prisma.turf.findUnique({ where: { id: booking.turfId } });
    }
    if (!sportData && booking.sportId) {
      sportData = await prisma.sport.findUnique({ where: { id: booking.sportId } });
    }

    eventBus.emit('booking.confirmed', {
      bookingId: booking.id,
      memberId: booking.memberId,
      customerName: booking.member?.name || '',
      turfName: turfData?.name || '',
      sportName: sportData?.name || '',
      startTime: booking.startTime,
      endTime: booking.endTime,
      price: booking.price,
      discountAmount: booking.discountAmount,
      paymentStatus: 'PAID',
      mobile: booking.member?.mobile || null,
      participantCount: booking.participantCount,
    });

    eventBus.emit('payment.success', {
      bookingId: booking.id,
      memberId: booking.memberId,
      gateway: booking.gateway || 'ONLINE',
      amount: booking.price - (booking.discountAmount || 0),
      paymentStatus: 'PAID',
      booking,
    });
  } catch (err) {
    logger.error('Error generating tickets or emitting confirmation events', err);
  }
}

/**
 * Cleanup routine to expire abandoned transactions and release slot locks.
 */
export async function expireAbandonedTransactions(timeoutMinutes: number = 15) {
  return await BookingCleanupService.cleanupAbandonedBookings(timeoutMinutes);
}

export class PaymentSettlementService {
  static settleSuccessfulPayment = settleSuccessfulPayment;
  static sendConfirmationAndTickets = sendConfirmationAndTickets;
  static expireAbandonedTransactions = expireAbandonedTransactions;
}
