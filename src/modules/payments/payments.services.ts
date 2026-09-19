import { prisma } from '@/core/database/prisma';
import { ApiError } from '@/core/http/api-handler';
import { createRazorpayOrder } from './razorpay.services';
import { createPhonePeOrder } from './phonepe.services';

/**
 * Unified router for creating orders across Razorpay and PhonePe.
 */
export async function createOrder(
  bookingId: string,
  gateway: 'RAZORPAY' | 'PHONEPE',
  platform: 'WEB' | 'APP' = 'WEB',
  origin?: string,
  redirectPath?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { member: true }
  });

  if (!booking) throw new ApiError('Booking not found', 404);
  if (booking.paymentStatus === 'PAID') throw new ApiError('Booking is already paid', 400);

  if (gateway === 'RAZORPAY') {
    return await createRazorpayOrder(booking, platform, origin);
  }

  if (gateway === 'PHONEPE') {
    return await createPhonePeOrder(booking, platform, origin, redirectPath);
  }

  throw new ApiError('Invalid gateway selected', 400);
}

