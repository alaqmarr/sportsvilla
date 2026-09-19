import { prisma } from '@/core/database/prisma';
import { formatIST } from '@/core/utils/dateUtils';
import { Booking, Payment } from '@/generated/client';
import { runner } from '@/automations';
import { BookingCleanupDetails } from '@/automations/tasks/booking-cleanup.task';

export interface CleanupSummary {
  expiredCount: number;
  refundedCount: number;
  totalRefundPaise: number;
  errors: string[];
}

export class AvailabilityService {
  /**
   * Generates availability slots for turfs offering a specific sport on a given date.
   */
  static async getAvailability(dateStr: string, sportId: string) {
    // 1. Fetch turfs that support this sport
    const turfs = await prisma.turf.findMany({
      where: {
        sports: {
          some: { sportId }
        }
      }
    });

    if (turfs.length === 0) {
      return [];
    }

    // 2. Define Time Boundaries for the given date (assuming IST timezone)
    const startOfDay = new Date(`${dateStr}T00:00:00.000+05:30`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999+05:30`);

    // 3. Fetch all active bookings for these turfs on this date (including cross-midnight overlaps)
    const turfIds = turfs.map(t => t.id);
    const activeBookings = await prisma.booking.findMany({
      where: {
        turfId: { in: turfIds },
        status: { not: 'CANCELLED' },
        startTime: { lt: endOfDay },
        endTime: { gt: startOfDay },
        OR: [
          { status: { in: ['CONFIRMED', 'COMPLETED'] } },
          { 
            status: 'PAYMENT_PENDING', 
            createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) } 
          }
        ]
      }
    });

    // 4. Generate Slots (Default 6 AM to 11 PM)
    const OPEN_HOUR = 6;
    const CLOSE_HOUR = 23;
    const nowMs = Date.now();

    const result = turfs.map(turf => {
      const duration = turf.bookingDurationMinutes || 60;
      const price = turf.bookingPrice || 600;
      const capacity = turf.capacityPerSlot || 1;
      
      const slots = [];
      let currentHour = OPEN_HOUR;
      let currentMin = 0;

      while (currentHour < CLOSE_HOUR) {
        // Safe cross-timezone construction
        const slotStart = new Date(`${dateStr}T${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}:00+05:30`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        // Calculate used capacity based on time overlap intersection
        const overlappingBookings = activeBookings.filter(b => 
          b.turfId === turf.id && 
          b.startTime.getTime() < slotEnd.getTime() &&
          b.endTime.getTime() > slotStart.getTime()
        );

        const usedCapacity = overlappingBookings.reduce((sum, b) => sum + (b.participantCount || 1), 0);
        const availableCourts = Math.max(0, capacity - usedCapacity);
        const isAvailable = availableCourts > 0;

        if (slotStart.getTime() > nowMs) {
          slots.push({
            time: formatIST(slotStart, 'hh:mm a'),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            price,
            availableCourts,
            available: isAvailable
          });
        }

        // Increment time
        currentMin += duration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }

      return {
        id: turf.id,
        name: turf.name,
        iconPath: turf.iconPath,
        capacityPerSlot: capacity,
        bookingPrice: price,
        slots
      };
    });

    return result;
  }
}

export class BookingService {
  /**
   * Calculates the refund and penalty for a given booking.
   * Based on the cancellation limit hours and the total wallet amount paid.
   */
  static getRefundPreview(
    booking: Booking & { payments: Payment[] },
    cancellationLimitHours: number
  ): { penalty: number; refund: number; isFree: boolean; totalPaid: number } {
    const totalPaid = booking.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

    const startDate = new Date(booking.startTime);
    const now = new Date();
    const diffMs = startDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let penalty = 0;
    let isFree = true;

    if (diffHours < 0) {
      // Past booking: maximum penalty applies, zero refund
      penalty = Math.max(booking.price, totalPaid);
      isFree = false;
    } else if (diffHours < cancellationLimitHours) {
      const hourIndex = Math.ceil(cancellationLimitHours - diffHours);
      const penaltyPercentage = Math.min(1, hourIndex / cancellationLimitHours);
      penalty = booking.price * penaltyPercentage;
      isFree = false;
    }

    const refund = Math.max(0, totalPaid - penalty);
    return { penalty, refund, isFree, totalPaid };
  }
}

export class BookingCleanupService {
  /**
   * Finds and cancels PAYMENT_PENDING bookings older than timeoutMinutes (default: 15m).
   * Restores member wallet balance in paise, restores loyalty points,
   * releases reserved coupons, and marks pending transactions as ABANDONED.
   *
   * Delegates to the centralized automation task runner.
   */
  static async cleanupAbandonedBookings(timeoutMinutes: number = 15): Promise<CleanupSummary> {
    const result = await runner.runTask('booking-cleanup', { timeoutMinutes });
    const details = result.details as BookingCleanupDetails | undefined;

    return {
      expiredCount: details?.expiredCount ?? result.processedCount,
      refundedCount: details?.refundedCount ?? 0,
      totalRefundPaise: details?.totalRefundPaise ?? 0,
      errors: details?.errors ?? result.errors ?? [],
    };
  }
}
