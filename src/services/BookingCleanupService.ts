import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface CleanupSummary {
  expiredCount: number;
  refundedCount: number;
  totalRefundPaise: number;
  errors: string[];
}

export class BookingCleanupService {
  /**
   * Finds and cancels PAYMENT_PENDING bookings older than timeoutMinutes (default: 15m).
   * Restores member wallet balance in paise, restores loyalty points,
   * releases reserved coupons, and marks pending transactions as ABANDONED.
   */
  static async cleanupAbandonedBookings(timeoutMinutes: number = 15): Promise<CleanupSummary> {
    const cutoffDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const summary: CleanupSummary = {
      expiredCount: 0,
      refundedCount: 0,
      totalRefundPaise: 0,
      errors: []
    };

    try {
      // Find candidate expired bookings
      const expiredCandidates = await prisma.booking.findMany({
        where: {
          status: 'PAYMENT_PENDING',
          createdAt: { lt: cutoffDate }
        },
        select: { id: true }
      });

      if (expiredCandidates.length === 0) {
        return summary;
      }

      for (const candidate of expiredCandidates) {
        try {
          await prisma.$transaction(async (tx) => {
            // Re-fetch booking within transaction to prevent race conditions with concurrent payment
            const booking = await tx.booking.findUnique({
              where: { id: candidate.id },
              include: { member: true, couponUsages: true }
            });

            // Guard against concurrent settlement
            if (!booking || booking.status !== 'PAYMENT_PENDING') {
              return;
            }

            // 1. Mark booking as CANCELLED and reset balance
            await tx.booking.update({
              where: { id: booking.id },
              data: {
                status: 'CANCELLED',
                paymentStatus: 'UNPAID',
                amountDue: booking.price,
                advancePaid: 0
              }
            });

            // 2. Auto-refund wallet balance if advance was paid
            if (booking.advancePaid > 0) {
              const refundPaise = Math.round(booking.advancePaid * 100);

              // Resolve original paying member in case of family booking delegation
              const originalDebit = await tx.walletTransaction.findFirst({
                where: {
                  description: { contains: booking.id },
                  type: 'DEBIT'
                }
              });
              const refundMemberId = originalDebit?.memberId || booking.memberId;

              await tx.member.update({
                where: { id: refundMemberId },
                data: {
                  walletBalance: { increment: refundPaise }
                }
              });

              await tx.walletTransaction.create({
                data: {
                  memberId: refundMemberId,
                  amount: refundPaise,
                  type: 'CREDIT',
                  description: 'Refund: Booking expired (payment not completed)'
                }
              });

              await tx.transaction.create({
                data: {
                  bookingId: booking.id,
                  memberId: refundMemberId,
                  gateway: 'WALLET',
                  amount: booking.advancePaid,
                  currency: 'INR',
                  status: 'SUCCESS',
                  metadata: JSON.stringify({
                    action: 'AUTO_REFUND_EXPIRED_BOOKING',
                    refundPaise,
                    refundedAt: new Date().toISOString()
                  })
                }
              });

              summary.refundedCount++;
              summary.totalRefundPaise += refundPaise;
              logger.info('Auto-refunded wallet balance for expired booking', {
                bookingId: booking.id,
                memberId: refundMemberId,
                refundPaise
              });
            }

            // 3. Restore redeemed loyalty points
            if (booking.pointsRedeemed > 0) {
              await tx.member.update({
                where: { id: booking.memberId },
                data: {
                  loyaltyPoints: { increment: booking.pointsRedeemed }
                }
              });

              await tx.loyaltyHistory.create({
                data: {
                  memberId: booking.memberId,
                  points: booking.pointsRedeemed,
                  type: 'REFUND',
                  source: 'BOOKING',
                  description: `Auto-refund points for expired booking #${booking.id}`
                }
              });
            }

            // 4. Release reserved coupon usage
            if (booking.couponUsages && booking.couponUsages.length > 0) {
              await tx.couponUsage.deleteMany({
                where: { bookingId: booking.id }
              });
            }

            // 5. Update pending gateway transactions to ABANDONED
            await tx.transaction.updateMany({
              where: {
                bookingId: booking.id,
                status: 'PENDING'
              },
              data: {
                status: 'ABANDONED',
                errorMessage: 'Payment session expired (>15m)'
              }
            });

            summary.expiredCount++;
          });
        } catch (bookingErr: unknown) {
          const errMsg = `Failed to cleanup booking ${candidate.id}: ${bookingErr instanceof Error ? bookingErr.message : String(bookingErr)}`;
          logger.error(errMsg);
          summary.errors.push(errMsg);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Error during cleanupAbandonedBookings run', err);
      summary.errors.push(errorMsg);
    }

    return summary;
  }
}
