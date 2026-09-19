import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { logger } from '@/core/logging/logger';
import { bumpSyncTimestamp } from '@/core/database/sync';

export interface BookingCompletionOptions {
  bufferMinutes?: number;
}

export interface BookingCompletionDetails {
  completedBookings: number;
  expiredTickets: number;
  errors: string[];
}

export class BookingCompletionTask implements AutomationTask<BookingCompletionOptions, BookingCompletionDetails> {
  readonly id = 'booking-completion';
  readonly name = 'Booking Completion & Ticket Invalidation';
  readonly description = 'Transitions confirmed bookings whose end times have passed (with 30m buffer) to COMPLETED and invalidates remaining unused tickets to EXPIRED.';
  readonly schedule = '*/30 * * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 60000;

  async run(options?: BookingCompletionOptions): Promise<TaskResult<BookingCompletionDetails>> {
    const bufferMinutes = options?.bufferMinutes ?? 30;
    const now = new Date();
    const completionCutoff = new Date(Date.now() - bufferMinutes * 60 * 1000);
    const errors: string[] = [];
    let completedBookings = 0;
    let expiredTickets = 0;

    try {
      // 1. Transition confirmed bookings past end time + buffer to COMPLETED
      const bookingResult = await prisma.booking.updateMany({
        where: {
          status: 'CONFIRMED',
          endTime: { lt: completionCutoff },
        },
        data: {
          status: 'COMPLETED',
        },
      });
      completedBookings = bookingResult.count;

      // 2. Invalidate unused tickets where the booking end time has passed
      const pastBookings = await prisma.booking.findMany({
        where: {
          endTime: { lt: now },
        },
        select: { id: true },
      });

      if (pastBookings.length > 0) {
        const pastBookingIds = pastBookings.map((b) => b.id);
        const ticketResult = await prisma.ticket.updateMany({
          where: {
            bookingId: { in: pastBookingIds },
            status: 'VALID',
          },
          data: {
            status: 'EXPIRED',
          },
        });
        expiredTickets = ticketResult.count;
      }

      if (completedBookings > 0 || expiredTickets > 0) {
        logger.info(
          `[BookingCompletionTask] Completed ${completedBookings} bookings and invalidated ${expiredTickets} unused tickets`
        );
        await bumpSyncTimestamp('booking');
      }
    } catch (err: unknown) {
      const msg = `Failed to process booking completion: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    const totalProcessed = completedBookings + expiredTickets;

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: totalProcessed,
      details: {
        completedBookings,
        expiredTickets,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const bookingCompletionTask = new BookingCompletionTask();
