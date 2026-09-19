import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { logger } from '@/core/logging/logger';
import { sendWalletTransactionPush } from '@/modules/notifications/notifications.services';
import { bumpSyncTimestamp } from '@/core/database/sync';

export interface BookingCleanupOptions {
  timeoutMinutes?: number;
}

export interface BookingCleanupDetails {
  expiredCount: number;
  refundedCount: number;
  totalRefundPaise: number;
  errors: string[];
}

export class BookingCleanupTask implements AutomationTask<BookingCleanupOptions, BookingCleanupDetails> {
  readonly id = 'booking-cleanup';
  readonly name = 'Abandoned Booking Cleanup';
  readonly description = 'Cancels abandoned PAYMENT_PENDING bookings older than 15 minutes, auto-refunds advance wallet payments in paise, restores loyalty points, cancels coupons, and marks transactions as abandoned.';
  readonly schedule = '*/10 * * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 60000;

  async run(options?: BookingCleanupOptions): Promise<TaskResult<BookingCleanupDetails>> {
    const timeoutMinutes = options?.timeoutMinutes ?? 15;
    const cutoffDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    const errors: string[] = [];
    let expiredCount = 0;
    let refundedCount = 0;
    let totalRefundPaise = 0;

    try {
      const expiredCandidates = await prisma.booking.findMany({
        where: {
          status: 'PAYMENT_PENDING',
          createdAt: { lt: cutoffDate }
        },
        select: { id: true }
      });

      for (const candidate of expiredCandidates) {
        try {
          await prisma.$transaction(async (tx) => {
            const booking = await tx.booking.findUnique({
              where: { id: candidate.id },
              include: { member: true, couponUsages: true }
            });

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

              refundedCount++;
              totalRefundPaise += refundPaise;

              sendWalletTransactionPush(
                refundMemberId,
                booking.advancePaid,
                'CREDIT',
                'Refund: Booking expired (payment not completed)'
              ).catch((err) => {
                logger.error('[Push Hook Error] Auto-refund push failed for expired booking', err);
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

            // 6. Reset attached DisplaySession if exists
            await tx.displaySession.updateMany({
              where: { bookingId: booking.id },
              data: {
                status: 'IDLE',
                bookingId: null
              }
            });

            expiredCount++;
          });
        } catch (bookingErr: unknown) {
          const errMsg = `Failed to cleanup booking ${candidate.id}: ${bookingErr instanceof Error ? bookingErr.message : String(bookingErr)}`;
          logger.error(errMsg);
          errors.push(errMsg);
        }
      }

      if (expiredCount > 0) {
        await bumpSyncTimestamp('booking');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('[BookingCleanupTask] Error during abandoned bookings scan:', err);
      errors.push(errorMsg);
    }

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: expiredCount,
      details: {
        expiredCount,
        refundedCount,
        totalRefundPaise,
        errors
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date()
    };
  }
}

export const bookingCleanupTask = new BookingCleanupTask();
