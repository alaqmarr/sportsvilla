import { withApiHandler } from '@/lib/api-handler';
import { PaymentService } from '@/services/PaymentService';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.text(); // We need raw text to parse JSON safely if needed, but phonepe sends JSON
  
  const payload = JSON.parse(body);
  const xVerify = request.headers.get('x-verify') || '';

  if (!payload.response || !xVerify) {
    return { success: false, error: 'Invalid webhook payload' };
  }

  const data = await PaymentService.verifyPhonePeWebhook(payload.response, xVerify);

  if (data.code === 'PAYMENT_SUCCESS') {
    const transactionId = data.data.merchantTransactionId; // T{timestamp}{bookingId}
    const bookingId = transactionId.substring(14); // Very hacky based on transaction ID structure, better approach below
    
    // In our createOrder, we did: `T${Date.now()}${booking.id.substring(0, 5)}`
    // Wait, let's extract booking ID properly by passing it in callbackUrl query params.
    
    const { searchParams } = new URL(request.url);
    const urlBookingId = searchParams.get('bookingId');

    if (urlBookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: urlBookingId } });
      if (booking && booking.paymentStatus !== 'PAID') {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: { paymentStatus: 'PAID' }
          }),
          prisma.payment.create({
            data: {
              bookingId: booking.id,
              amount: booking.amountDue,
              method: 'ONLINE'
            }
          })
        ]);
        logger.info(`PhonePe Webhook Payment Verified`, { bookingId: booking.id });
      }
    }
  }

  return { success: true };
});
