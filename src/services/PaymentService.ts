import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-handler';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import Razorpay from 'razorpay';

export class PaymentService {
  /**
   * Retrieves the active payment gateways and their public configuration.
   */
  static async getPaymentConfig() {
    const activeSetting = await prisma.setting.findUnique({ where: { key: 'PAYMENT_GATEWAY_ACTIVE' } });
    const activeGateway = activeSetting?.value || 'NONE'; // "RAZORPAY", "PHONEPE", "BOTH", "NONE"

    const config: any = { activeGateway };

    if (['RAZORPAY', 'BOTH'].includes(activeGateway)) {
      const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
      config.razorpayKeyId = rzpKey?.value || null;
    }

    if (['PHONEPE', 'BOTH'].includes(activeGateway)) {
      const ppEnv = await prisma.setting.findUnique({ where: { key: 'PHONEPE_ENV' } });
      const ppMerchantId = await prisma.setting.findUnique({ where: { key: 'PHONEPE_MERCHANT_ID' } });
      config.phonepeEnv = ppEnv?.value || 'UAT';
      config.phonepeMerchantId = ppMerchantId?.value || null;
    }

    return config;
  }

  /**
   * Creates an order/checkout session for the specified gateway.
   */
  static async createOrder(bookingId: string, gateway: 'RAZORPAY' | 'PHONEPE') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { member: true }
    });

    if (!booking) throw new ApiError('Booking not found', 404);
    if (booking.paymentStatus === 'PAID') throw new ApiError('Booking is already paid', 400);

    const amountDue = booking.amountDue; // Assumed calculated correctly at booking creation
    if (amountDue <= 0) throw new ApiError('No amount due', 400);

    if (gateway === 'RAZORPAY') {
      const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
      const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
      
      if (!rzpKey?.value || !rzpSecret?.value) throw new ApiError('Razorpay is not configured', 500);

      const razorpay = new Razorpay({
        key_id: rzpKey.value,
        key_secret: rzpSecret.value
      });

      const options = {
        amount: Math.round(amountDue * 100), // amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${booking.id}`
      };

      try {
        const order = await razorpay.orders.create(options);
        return {
          gateway: 'RAZORPAY',
          orderId: order.id,
          amount: amountDue,
          keyId: rzpKey.value
        };
      } catch (err: any) {
        logger.error('Razorpay Order Creation Failed', err);
        throw new ApiError('Failed to create Razorpay order', 500);
      }
    } 
    
    if (gateway === 'PHONEPE') {
      const merchantId = await prisma.setting.findUnique({ where: { key: 'PHONEPE_MERCHANT_ID' } });
      const saltKey = await prisma.setting.findUnique({ where: { key: 'PHONEPE_SALT_KEY' } });
      const saltIndex = await prisma.setting.findUnique({ where: { key: 'PHONEPE_SALT_INDEX' } });
      const env = await prisma.setting.findUnique({ where: { key: 'PHONEPE_ENV' } });

      if (!merchantId?.value || !saltKey?.value || !saltIndex?.value) {
        throw new ApiError('PhonePe is not configured', 500);
      }

      const transactionId = `T${Date.now()}${booking.id.substring(0, 5)}`;
      
      const payload = {
        merchantId: merchantId.value,
        merchantTransactionId: transactionId,
        merchantUserId: booking.memberId,
        amount: Math.round(amountDue * 100), // paise
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/client/v1/payments/phonepe-redirect?bookingId=${booking.id}`,
        redirectMode: "POST",
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/client/v1/payments/webhook?gateway=PHONEPE&bookingId=${booking.id}`,
        mobileNumber: booking.member.mobile,
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      };

      const payloadString = JSON.stringify(payload);
      const base64Payload = Buffer.from(payloadString).toString('base64');
      const endpoint = "/pg/v1/pay";
      const stringToHash = base64Payload + endpoint + saltKey.value;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${saltIndex.value}`;

      // Return SDK Payload instead of calling API directly
      return {
        gateway: 'PHONEPE',
        transactionId: transactionId,
        amount: amountDue,
        base64Body: base64Payload,
        checksum: xVerify,
        apiEndPoint: endpoint,
        environment: env?.value === 'PROD' ? 'PRODUCTION' : 'SANDBOX',
        appId: "" // Set to merchant app id if assigned
      };
    }

    throw new ApiError('Invalid gateway selected', 400);
  }

  /**
   * Verifies a Razorpay payment signature.
   */
  static async verifyRazorpayPayment(bookingId: string, orderId: string, paymentId: string, signature: string) {
    const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
    if (!rzpSecret?.value) throw new ApiError('Razorpay is not configured', 500);

    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto.createHmac('sha256', rzpSecret.value)
                                    .update(body.toString())
                                    .digest('hex');

    if (expectedSignature !== signature) {
      throw new ApiError('Invalid payment signature', 400);
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new ApiError('Booking not found', 404);

    // Mark as paid and settle balance fields atomically
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
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

    logger.info(`Razorpay Payment Verified`, { bookingId, paymentId });

    return { success: true };
  }

  /**
   * Verifies a PhonePe Server-to-Server webhook callback.
   */
  static async verifyPhonePeWebhook(responseBase64: string, xVerifyHeader: string) {
    const saltKey = await prisma.setting.findUnique({ where: { key: 'PHONEPE_SALT_KEY' } });
    const saltIndex = await prisma.setting.findUnique({ where: { key: 'PHONEPE_SALT_INDEX' } });

    if (!saltKey?.value || !saltIndex?.value) {
      throw new ApiError('PhonePe is not configured', 500);
    }

    // Verify signature
    const stringToHash = responseBase64 + saltKey.value;
    const expectedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const expectedXVerify = `${expectedSha256}###${saltIndex.value}`;

    if (xVerifyHeader !== expectedXVerify) {
      throw new ApiError('Invalid PhonePe signature', 400);
    }

    const payloadStr = Buffer.from(responseBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    return payload;
  }
}
