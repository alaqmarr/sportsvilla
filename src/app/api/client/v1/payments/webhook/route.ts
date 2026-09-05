import { withApiHandler } from '@/lib/api-handler';
import { PaymentService } from '@/services/PaymentService';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.text();
  
  const payload = JSON.parse(body);
  const xVerify = request.headers.get('x-verify') || '';

  if (!payload.response || !xVerify) {
    return { success: false, error: 'Invalid webhook payload' };
  }

  const data = await PaymentService.verifyPhonePeWebhook(payload.response, xVerify);

  if (data.code === 'PAYMENT_SUCCESS') {
    const { searchParams } = new URL(request.url);
    const urlBookingId = searchParams.get('bookingId');

    if (urlBookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: urlBookingId } });
      if (booking && booking.paymentStatus !== 'PAID') {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: { 
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              amountDue: 0,
              advancePaid: { increment: booking.amountDue }
            }
          }),
          prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: booking.amountDue,
              method: 'ONLINE'
            }
          })
        ]);
        logger.info(`PhonePe Webhook Payment Verified & Settled`, { bookingId: booking.id });
      }
    }
  }

  return { success: true };
});
