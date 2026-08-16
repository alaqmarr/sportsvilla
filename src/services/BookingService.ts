import { prisma } from '@/lib/prisma';
import { Booking, Payment } from '@prisma/client';

export class BookingService {
  /**
   * Calculates the refund and penalty for a given booking.
   * Based on the cancellation limit hours and the total wallet amount paid.
   */
  static getRefundPreview(
    booking: Booking & { payments: Payment[] },
    cancellationLimitHours: number
  ): { penalty: number; refund: number; isFree: boolean; totalPaid: number } {
    const walletPayments = booking.payments?.filter(p => p.method === 'WALLET') || [];
    const totalPaid = walletPayments.reduce((sum, p) => sum + p.amount, 0);

    const startDate = new Date(booking.startTime);
    const now = new Date();
    const diffMs = startDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let penalty = 0;
    let isFree = true;

    if (diffHours < cancellationLimitHours && diffHours >= 0) {
      const hourIndex = Math.ceil(cancellationLimitHours - diffHours);
      const penaltyPercentage = hourIndex / cancellationLimitHours;
      penalty = booking.price * penaltyPercentage;
      isFree = false;
    }

    const refund = Math.max(0, totalPaid - penalty);
    return { penalty, refund, isFree, totalPaid };
  }
}
