import { withApiHandler, ApiError } from '@/lib/api-handler';
import { PaymentService } from '@/services/PaymentService';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

export const POST = withApiHandler(async (request: Request) => {
  const body = await request.text();
  const { searchParams } = new URL(request.url);
  const gatewayParam = searchParams.get('gateway');
  const urlBookingId = searchParams.get('bookingId');
  const xVerify = request.headers.get('x-verify');
  const xRazorpaySignature = request.headers.get('x-razorpay-signature');

  // ==========================================================================
  // 1. RAZORPAY WEBHOOK HANDLER
  // ==========================================================================
  if (gatewayParam === 'RAZORPAY' || xRazorpaySignature) {
    if (!xRazorpaySignature) {
      throw new ApiError('Missing Razorpay signature', 401);
    }

    const rzpWebhookSecret = await prisma.setting.findUnique({
      where: { key: 'RAZORPAY_WEBHOOK_SECRET' }
    });
    const fallbackSecret = await prisma.setting.findUnique({
      where: { key: 'RAZORPAY_KEY_SECRET' }
    });
    const secret = rzpWebhookSecret?.value || fallbackSecret?.value;

    if (!secret) {
      logger.error('Razorpay webhook secret not configured');
      throw new ApiError('Webhook secret not configured', 500);
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const sigBuf = Buffer.from(xRazorpaySignature, 'utf-8');
    const isValid = expectedBuf.length === sigBuf.length && crypto.timingSafeEqual(expectedBuf, sigBuf);

    if (!isValid) {
      logger.warn('Invalid Razorpay webhook signature');
      throw new ApiError('Invalid webhook signature', 401);
    }

    try {
      const eventData = JSON.parse(body);
      const event = eventData.event;
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amountPaise = paymentEntity?.amount || 0;
      const paidAmountRupees = amountPaise / 100;

      if (event === 'order.paid' || event === 'payment.captured') {
        let booking = null;
        if (urlBookingId) {
          booking = await prisma.booking.findUnique({ where: { id: urlBookingId } });
        }
        if (!booking && orderId) {
          const tx = await prisma.transaction.findFirst({
            where: { gatewayOrderId: orderId, gateway: 'RAZORPAY' }
          });
          if (tx?.bookingId) {
            booking = await prisma.booking.findUnique({ where: { id: tx.bookingId } });
          }
        }

        if (booking) {
          const settleResult = await PaymentService.settleSuccessfulPayment({
            bookingId: booking.id,
            gateway: 'RAZORPAY',
            gatewayOrderId: orderId,
            gatewayPaymentId: paymentId,
            paidAmountRupees: paidAmountRupees || booking.amountDue,
            metadata: { webhook: true, event }
          });

          if (settleResult.success && settleResult.status === 'PAID') {
            await PaymentService.sendConfirmationAndTickets(settleResult.booking);
          }
        }
      } else if (event === 'payment_link.paid') {
        const linkEntity = eventData.payload?.payment_link?.entity;
        const refId = linkEntity?.reference_id;
        const paidAmountRupees = (linkEntity?.amount_paid || 0) / 100;
        
        if (refId) {
          // reference_id can be comma separated bookingIds
          const bookingIds = refId.split(',');
          for (const bid of bookingIds) {
            const booking = await prisma.booking.findUnique({ where: { id: bid } });
            if (booking && booking.paymentStatus !== 'PAID') {
               const settleResult = await PaymentService.settleSuccessfulPayment({
                 bookingId: booking.id,
                 gateway: 'RAZORPAY',
                 gatewayOrderId: linkEntity.order_id,
                 gatewayPaymentId: null, // we might not have it here easily
                 paidAmountRupees: paidAmountRupees,
                 metadata: { webhook: true, event, paymentLinkId: linkEntity.id }
               });
               if (settleResult.success && settleResult.status === 'PAID') {
                 await PaymentService.sendConfirmationAndTickets(settleResult.booking);
               }
            }
          }
        }
      } else if (event === 'payment.failed' && orderId) {
        await prisma.transaction.updateMany({
          where: { gatewayOrderId: orderId, gateway: 'RAZORPAY', status: 'PENDING' },
          data: {
            status: 'FAILED',
            gatewayPaymentId: paymentId,
            errorMessage: paymentEntity?.error_description || 'Payment failed on gateway',
            metadata: JSON.stringify({ webhook: true, error: paymentEntity?.error_description })
          }
        });
      }

      return { success: true };
    } catch (parseErr) {
      if (parseErr instanceof ApiError) {
        throw parseErr;
      }
      logger.error('Failed to parse Razorpay webhook payload', parseErr);
      throw new ApiError('Invalid payload', 400);
    }
  }

  // ==========================================================================
  // 2. PHONEPE WEBHOOK HANDLER
  // ==========================================================================
  let payload: any = null;
  try {
    payload = JSON.parse(body);
  } catch {
    return { success: false, error: 'Invalid JSON payload' };
  }

  if (!payload?.response || !xVerify) {
    return { success: false, error: 'Invalid webhook payload' };
  }

  const data = await PaymentService.verifyPhonePeWebhook(payload.response, xVerify);

  if (data.code === 'PAYMENT_SUCCESS') {
    let bookingId = urlBookingId;
    const merchantTxId = data.data?.merchantTransactionId;

    if (!bookingId && merchantTxId) {
      const existingTx = await prisma.transaction.findFirst({
        where: { gatewayOrderId: merchantTxId, gateway: 'PHONEPE' }
      });
      if (existingTx?.bookingId) {
        bookingId = existingTx.bookingId;
      }
    }

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });

      if (booking) {
        const paidAmount = data.data?.amount ? data.data.amount / 100 : booking.amountDue;
        const providerRef = data.data?.transactionId || data.data?.providerReferenceId || null;

        const settleResult = await PaymentService.settleSuccessfulPayment({
          bookingId: booking.id,
          gateway: 'PHONEPE',
          gatewayOrderId: merchantTxId,
          gatewayPaymentId: providerRef,
          paidAmountRupees: paidAmount,
          metadata: { webhook: true, phonePeResponse: data }
        });

        if (settleResult.success && settleResult.status === 'PAID') {
          await PaymentService.sendConfirmationAndTickets(settleResult.booking);
        }
      }
    }
  } else if (data.code && !['PAYMENT_SUCCESS', 'PAYMENT_PENDING', 'PAYMENT_INITIATED'].includes(data.code)) {
    const merchantTxId = data.data?.merchantTransactionId;
    if (merchantTxId) {
      await prisma.transaction.updateMany({
        where: { gatewayOrderId: merchantTxId, gateway: 'PHONEPE', status: 'PENDING' },
        data: {
          status: 'FAILED',
          errorMessage: data.message || `PhonePe returned ${data.code}`,
          metadata: JSON.stringify({ webhook: true, phonePeResponse: data })
        }
      });
    }
  }

  return { success: true };
});
