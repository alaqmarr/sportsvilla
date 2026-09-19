import { prisma } from '@/core/database/prisma';
import { ApiError } from '@/core/http/api-handler';
import { logger } from '@/core/logging/logger';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { settleSuccessfulPayment, sendConfirmationAndTickets } from './payment-settlement.services';

/**
 * Creates a Razorpay order and logs initial PENDING transaction.
 */
export async function createRazorpayOrder(
  booking: any,
  platform: 'WEB' | 'APP' = 'WEB',
  origin?: string
) {
  const amountDue = booking.amountDue;
  if (amountDue <= 0) throw new ApiError('No amount due', 400);

  const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
  const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
  
  if (!rzpKey?.value || !rzpSecret?.value) throw new ApiError('Razorpay is not configured', 500);

  const razorpay = new Razorpay({
    key_id: rzpKey.value,
    key_secret: rzpSecret.value
  });

  const options = {
    amount: Math.round(amountDue * 100),
    currency: 'INR',
    receipt: `receipt_${booking.id}`
  };

  try {
    const order = await razorpay.orders.create(options);

    // Hook: Log initial PENDING transaction
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        memberId: booking.memberId,
        gateway: 'RAZORPAY',
        gatewayOrderId: order.id,
        amount: amountDue,
        currency: 'INR',
        status: 'PENDING',
        metadata: JSON.stringify({
          platform,
          receipt: options.receipt,
          razorpayOrderId: order.id,
          origin: origin || null,
          initiatedAt: new Date().toISOString()
        })
      }
    });

    return {
      gateway: 'RAZORPAY' as const,
      orderId: order.id,
      amount: amountDue,
      keyId: rzpKey.value
    };
  } catch (err: unknown) {
    logger.error('Razorpay Order Creation Failed', err);

    // Hook: Log FAILED transaction attempt
    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        memberId: booking.memberId,
        gateway: 'RAZORPAY',
        amount: amountDue,
        currency: 'INR',
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Razorpay order creation failed',
        metadata: JSON.stringify({ platform, error: String(err), failedAt: new Date().toISOString() })
      }
    }).catch(logErr => logger.error('Failed to log failed Razorpay transaction', logErr));

    throw new ApiError('Failed to create Razorpay order', 500);
  }
}

/**
 * Creates a Razorpay Payment Link (short URL) for the given amount.
 */
export async function createPaymentLink(
  amount: number,
  description: string,
  customer: { name: string, contact: string },
  referenceId?: string
) {
  const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
  const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
  
  if (!rzpKey?.value || !rzpSecret?.value) throw new ApiError('Razorpay is not configured', 500);

  const razorpay = new Razorpay({
    key_id: rzpKey.value,
    key_secret: rzpSecret.value
  });

  try {
    const pl = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      description: description.substring(0, 2048),
      customer: {
        name: customer.name || "Customer",
        contact: customer.contact || "",
      },
      notify: {
        sms: false,
        email: false
      },
      reminder_enable: false,
      reference_id: referenceId
    });
    return pl.short_url;
  } catch (err: any) {
    throw new ApiError(err.message || 'Failed to create Razorpay payment link', 500);
  }
}

/**
 * Verifies a Razorpay payment signature, settles booking, and transitions transaction status.
 */
export async function verifyRazorpayPayment(
  bookingId: string,
  orderId: string,
  paymentId: string,
  signature: string
) {
  const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
  if (!rzpSecret?.value) throw new ApiError('Razorpay is not configured', 500);

  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto.createHmac('sha256', rzpSecret.value)
                                  .update(body.toString())
                                  .digest('hex');

  if (expectedSignature !== signature) {
    // Update or create FAILED transaction
    const existingTx = await prisma.transaction.findFirst({
      where: { gatewayOrderId: orderId, gateway: 'RAZORPAY' }
    });

    if (existingTx) {
      await prisma.transaction.update({
        where: { id: existingTx.id },
        data: {
          status: 'FAILED',
          gatewayPaymentId: paymentId,
          gatewaySignature: signature,
          errorMessage: 'Invalid payment signature',
          metadata: JSON.stringify({
            ...JSON.parse(existingTx.metadata || '{}'),
            failedAt: new Date().toISOString()
          })
        }
      });
    } else {
      await prisma.transaction.create({
        data: {
          bookingId,
          gateway: 'RAZORPAY',
          gatewayOrderId: orderId,
          gatewayPaymentId: paymentId,
          gatewaySignature: signature,
          amount: 0,
          status: 'FAILED',
          errorMessage: 'Invalid payment signature on untracked order'
        }
      });
    }

    throw new ApiError('Invalid payment signature', 400);
  }

  const transaction = await prisma.transaction.findFirst({
    where: { gatewayOrderId: orderId, gateway: 'RAZORPAY' }
  });

  if (!transaction) {
    throw new ApiError('Transaction not found for this order', 400);
  }

  if (transaction.bookingId !== bookingId) {
    logger.warn('Transaction bookingId mismatch', { orderId, expectedBookingId: transaction.bookingId, providedBookingId: bookingId });
    throw new ApiError('Transaction does not match the provided booking ID', 400);
  }

  const booking = await prisma.booking.findUnique({ 
    where: { id: bookingId }
  });
  if (!booking) throw new ApiError('Booking not found', 404);

  const settleResult = await settleSuccessfulPayment({
    bookingId,
    gateway: 'RAZORPAY',
    gatewayOrderId: orderId,
    gatewayPaymentId: paymentId,
    gatewaySignature: signature,
    paidAmountRupees: transaction.amount,
    metadata: { orderId, paymentId }
  });

  if (settleResult.success && settleResult.status === 'PAID') {
    await sendConfirmationAndTickets(settleResult.booking);
    return { success: true, status: 'PAID' };
  }

  if (settleResult.status === 'OVERBOOKED_REFUNDED') {
    return {
      success: false,
      status: 'OVERBOOKED_REFUNDED',
      message: settleResult.message
    };
  }

  return { success: true, status: settleResult.status };
}

export class RazorpayService {
  static createOrder = createRazorpayOrder;
  static createPaymentLink = createPaymentLink;
  static verifyRazorpayPayment = verifyRazorpayPayment;
}
