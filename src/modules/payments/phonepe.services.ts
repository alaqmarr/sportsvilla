import { prisma } from '@/core/database/prisma';
import { ApiError } from '@/core/http/api-handler';
import { logger } from '@/core/logging/logger';
import crypto from 'crypto';
import { getPhonePeConfig } from './payment-config.lib';
import { settleSuccessfulPayment, sendConfirmationAndTickets } from './payment-settlement.services';

/**
 * Creates a PhonePe payment session and logs initial PENDING transaction.
 */
export async function createPhonePeOrder(
  booking: any,
  platform: 'WEB' | 'APP' = 'WEB',
  origin?: string,
  redirectPath?: string
) {
  const amountDue = booking.amountDue;
  if (amountDue <= 0) throw new ApiError('No amount due', 400);

  const { merchantId, saltKey, saltIndex, env } = await getPhonePeConfig();

  if (!merchantId || !saltKey || !saltIndex) {
    throw new ApiError('PhonePe is not configured in database', 500);
  }

  const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const redirectUrlPath = redirectPath 
    ? `/api/client/v1/payments/phonepe-redirect?bookingId=${booking.id}&redirectPath=${encodeURIComponent(redirectPath)}`
    : `/api/client/v1/payments/phonepe-redirect?bookingId=${booking.id}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`;

  const payload: Record<string, unknown> = {
    merchantId: merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: booking.memberId,
    amount: Math.round(amountDue * 100),
    redirectUrl: `${baseUrl}${redirectUrlPath}`,
    redirectMode: "POST",
    callbackUrl: `${baseUrl}/api/client/v1/payments/webhook?gateway=PHONEPE&bookingId=${booking.id}`,
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
    : 'https://api-preprod.phonepe.com/apis/hermes';

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
      // Hook: Log initial PENDING transaction
      await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          memberId: booking.memberId,
          gateway: 'PHONEPE',
          gatewayOrderId: transactionId,
          amount: amountDue,
          currency: 'INR',
          status: 'PENDING',
          metadata: JSON.stringify({
            platform,
            merchantTransactionId: transactionId,
            redirectUrl: data.data?.instrumentResponse?.redirectInfo?.url,
            responseCode: data.code,
            initiatedAt: new Date().toISOString()
          })
        }
      });

      return {
        gateway: 'PHONEPE' as const,
        transactionId: transactionId,
        redirectUrl: data.data.instrumentResponse.redirectInfo.url,
      };
    } else {
      // Hook: Log FAILED transaction
      await prisma.transaction.create({
        data: {
          bookingId: booking.id,
          memberId: booking.memberId,
          gateway: 'PHONEPE',
          gatewayOrderId: transactionId,
          amount: amountDue,
          currency: 'INR',
          status: 'FAILED',
          errorMessage: data.message || 'PhonePe order initiation failed',
          metadata: JSON.stringify({ platform, response: data, failedAt: new Date().toISOString() })
        }
      }).catch(logErr => logger.error('Failed to log failed PhonePe transaction', logErr));

      logger.error('PhonePe API Error', data);
      throw new ApiError('Failed to initiate PhonePe transaction', 500);
    }
  } catch (err: unknown) {
    logger.error('PhonePe Server Call Failed', err);

    await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        memberId: booking.memberId,
        gateway: 'PHONEPE',
        gatewayOrderId: transactionId,
        amount: amountDue,
        currency: 'INR',
        status: 'FAILED',
        errorMessage: err instanceof Error ? err.message : 'Failed to connect to PhonePe',
        metadata: JSON.stringify({ platform, error: String(err), failedAt: new Date().toISOString() })
      }
    }).catch(logErr => logger.error('Failed to log network failure transaction', logErr));

    throw new ApiError('Failed to connect to PhonePe', 500);
  }
}

/**
 * Securely checks the status of a PhonePe transaction server-to-server.
 */
export async function checkPhonePeStatus(bookingId: string, transactionId: string) {
  const { merchantId, saltKey, saltIndex, env } = await getPhonePeConfig();

  if (!merchantId || !saltKey || !saltIndex) {
    throw new ApiError('PhonePe is not configured', 500);
  }

  const endpoint = `/pg/v1/status/${merchantId}/${transactionId}`;
  const stringToHash = endpoint + saltKey;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const xVerify = `${sha256}###${saltIndex}`;

  const phonePeHost = env === 'PROD' 
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/hermes';

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
    const booking = await prisma.booking.findUnique({ 
      where: { id: bookingId }
    });
    if (!booking) throw new ApiError('Booking not found', 404);

    const paidAmount = data.data?.amount ? data.data.amount / 100 : booking.amountDue;
    const providerRef = data.data?.transactionId || data.data?.providerReferenceId || null;

    const settleResult = await settleSuccessfulPayment({
      bookingId,
      gateway: 'PHONEPE',
      gatewayOrderId: transactionId,
      gatewayPaymentId: providerRef,
      paidAmountRupees: paidAmount,
      metadata: { phonePeResponse: data }
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

  // If transaction returned terminal error / decline
  if (data.code && !['PAYMENT_SUCCESS', 'PAYMENT_PENDING', 'PAYMENT_INITIATED'].includes(data.code)) {
    await prisma.transaction.updateMany({
      where: { gatewayOrderId: transactionId, gateway: 'PHONEPE', status: 'PENDING' },
      data: {
        status: 'FAILED',
        errorMessage: data.message || `PhonePe returned ${data.code}`,
        metadata: JSON.stringify({ phonePeResponse: data, failedAt: new Date().toISOString() })
      }
    }).catch(err => logger.error('Failed to mark PhonePe transaction as FAILED', err));
  }

  return { success: false, status: data.code || 'FAILED' };
}

/**
 * Verifies a PhonePe Server-to-Server webhook callback.
 */
export async function verifyPhonePeWebhook(responseBase64: string, xVerifyHeader: string) {
  const { saltKey, saltIndex } = await getPhonePeConfig();

  if (!saltKey || !saltIndex) {
    throw new ApiError('PhonePe is not configured', 500);
  }

  const stringToHash = responseBase64 + saltKey;
  const expectedSha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const expectedXVerify = `${expectedSha256}###${saltIndex}`;

  if (xVerifyHeader !== expectedXVerify) {
    throw new ApiError('Invalid PhonePe signature', 401);
  }

  const payloadStr = Buffer.from(responseBase64, 'base64').toString('utf-8');
  const payload = JSON.parse(payloadStr);

  return payload;
}

export class PhonePeService {
  static createOrder = createPhonePeOrder;
  static checkPhonePeStatus = checkPhonePeStatus;
  static verifyPhonePeWebhook = verifyPhonePeWebhook;
}
