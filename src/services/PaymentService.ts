import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-handler';
import { logger } from '@/lib/logger';
import crypto from 'crypto';
import Razorpay from 'razorpay';

export class PaymentService {
  static async getPhonePeConfig() {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['PHONEPE_MERCHANT_ID', 'PHONEPE_SALT_KEY', 'PHONEPE_SALT_INDEX', 'PHONEPE_ENV'] }
      }
    });
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    return {
      merchantId: map['PHONEPE_MERCHANT_ID'] || process.env.PHONEPE_MERCHANT_ID,
      saltKey: map['PHONEPE_SALT_KEY'] || process.env.PHONEPE_SALT_KEY,
      saltIndex: map['PHONEPE_SALT_INDEX'] || process.env.PHONEPE_SALT_INDEX || '1',
      env: map['PHONEPE_ENV'] || process.env.PHONEPE_ENV || 'UAT'
    };
  }

  /**
   * Retrieves the active payment gateways and their public configuration.
   */
  static async getPaymentConfig() {
    const activeSetting = await prisma.setting.findUnique({ where: { key: 'PAYMENT_GATEWAY_ACTIVE' } });
    const activeGateway = activeSetting?.value || 'NONE'; // "RAZORPAY", "PHONEPE", "BOTH", "NONE"

    const config: Record<string, unknown> = { activeGateway };

    if (['RAZORPAY', 'BOTH'].includes(activeGateway)) {
      const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
      config.razorpayKeyId = rzpKey?.value || null;
    }

    if (['PHONEPE', 'BOTH'].includes(activeGateway)) {
      const ppConfig = await PaymentService.getPhonePeConfig();
      config.phonepeEnv = ppConfig.env;
      config.phonepeMerchantId = ppConfig.merchantId;
    }

    return config;
  }

  /**
   * Creates an order/checkout session for the specified gateway.
   */
  static async createOrder(bookingId: string, gateway: 'RAZORPAY' | 'PHONEPE', platform: 'WEB' | 'APP' = 'WEB') {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { member: true }
    });

    if (!booking) throw new ApiError('Booking not found', 404);
    if (booking.paymentStatus === 'PAID') throw new ApiError('Booking is already paid', 400);

    const amountDue = booking.amountDue;
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
        amount: Math.round(amountDue * 100),
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
      } catch (err: unknown) {
        logger.error('Razorpay Order Creation Failed', err);
        throw new ApiError('Failed to create Razorpay order', 500);
      }
    } 
    
    if (gateway === 'PHONEPE') {
      const { merchantId, saltKey, saltIndex, env } = await PaymentService.getPhonePeConfig();

      if (!merchantId || !saltKey || !saltIndex) {
        throw new ApiError('PhonePe is not configured in database or environment variables', 500);
      }

      const transactionId = `T${Date.now()}${booking.id.substring(0, 5)}`;
      
      const payload: Record<string, unknown> = {
        merchantId: merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: booking.memberId,
        amount: Math.round(amountDue * 100),
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
      const stringToHash = base64Payload + endpoint + saltKey;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${saltIndex}`;

      const phonePeHost = env === 'PROD' 
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

      if (platform === 'APP') {
        // Return SDK Payload instead of calling API directly for Mobile App Native SDK
        return {
          gateway: 'PHONEPE',
          transactionId: transactionId,
          amount: amountDue,
          base64Body: base64Payload,
          checksum: xVerify,
          apiEndPoint: endpoint,
          environment: env === 'PROD' ? 'PRODUCTION' : 'SANDBOX',
          appId: "" 
        };
      }

      // Web Flow: Make Server-to-Server call to get redirect URL
      try {
        const response = await fetch(`${phonePeHost}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
          },
          body: JSON.stringify({ request: base64Payload })
        });

        const data = await response.json();
        if (data.success) {
          return {
            gateway: 'PHONEPE',
            transactionId: transactionId,
            redirectUrl: data.data.instrumentResponse.redirectInfo.url,
          };
        } else {
          logger.error('PhonePe API Error', data);
          throw new ApiError('Failed to initiate PhonePe transaction', 500);
        }
      } catch (err: unknown) {
        logger.error('PhonePe Server Call Failed', err);
        throw new ApiError('Failed to connect to PhonePe', 500);
      }
    }

    throw new ApiError('Invalid gateway selected', 400);
  }

  /**
   * Securely checks the status of a PhonePe transaction server-to-server.
   */
  static async checkPhonePeStatus(bookingId: string, transactionId: string) {
    const { merchantId, saltKey, saltIndex, env } = await PaymentService.getPhonePeConfig();

    if (!merchantId || !saltKey || !saltIndex) {
      throw new ApiError('PhonePe is not configured', 500);
    }

    const endpoint = `/pg/v1/status/${merchantId}/${transactionId}`;
    const stringToHash = endpoint + saltKey;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = `${sha256}###${saltIndex}`;

    const phonePeHost = env === 'PROD' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

    const response = await fetch(`${phonePeHost}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': merchantId,
      }
    });

    const data = await response.json();

    if (data.success && data.code === 'PAYMENT_SUCCESS') {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (booking && booking.paymentStatus !== 'PAID') {
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
        logger.info(`PhonePe Payment Verified & Settled`, { bookingId, transactionId });
      }
      return { success: true, status: 'PAID' };
    }

    return { success: false, status: data.code || 'FAILED' };
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
    const { saltKey, saltIndex } = await PaymentService.getPhonePeConfig();

    if (!saltKey || !saltIndex) {
      throw new ApiError('PhonePe is not configured', 500);
    }

    const stringToHash = responseBase64 + saltKey;
    const expectedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const expectedXVerify = `${expectedSha256}###${saltIndex}`;

    if (xVerifyHeader !== expectedXVerify) {
      throw new ApiError('Invalid PhonePe signature', 400);
    }

    const payloadStr = Buffer.from(responseBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    return payload;
  }
}
