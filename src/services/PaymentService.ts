import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api-handler';
import { logger } from '@/lib/logger';
import { BookingCleanupService } from '@/services/BookingCleanupService';
import crypto from 'crypto';
import Razorpay from 'razorpay';

export interface SettlePaymentParams {
  bookingId: string;
  gateway: 'RAZORPAY' | 'PHONEPE' | 'WALLET' | 'MANUAL';
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  gatewaySignature?: string | null;
  paidAmountRupees: number;
  metadata?: Record<string, unknown>;
}

export interface SettlePaymentResult {
  success: boolean;
  status: 'PAID' | 'ALREADY_PAID' | 'OVERBOOKED_REFUNDED';
  message?: string;
  booking?: any;
}

export class PaymentService {
  static async getPhonePeConfig() {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['PHONEPE_MERCHANT_ID', 'PHONEPE_SALT_KEY', 'PHONEPE_SALT_INDEX', 'PHONEPE_ENV'] }
      }
    });
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    return {
      merchantId: map['PHONEPE_MERCHANT_ID'],
      saltKey: map['PHONEPE_SALT_KEY'],
      saltIndex: map['PHONEPE_SALT_INDEX'] || '1',
      env: map['PHONEPE_ENV'] || 'UAT'
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
   * Creates an order/checkout session for the specified gateway and logs PENDING transaction.
   */
  static async createOrder(bookingId: string, gateway: 'RAZORPAY' | 'PHONEPE', platform: 'WEB' | 'APP' = 'WEB', origin?: string) {
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
          gateway: 'RAZORPAY',
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
    
    if (gateway === 'PHONEPE') {
      const { merchantId, saltKey, saltIndex, env } = await PaymentService.getPhonePeConfig();

      if (!merchantId || !saltKey || !saltIndex) {
        throw new ApiError('PhonePe is not configured in database', 500);
      }

      const transactionId = `T${Date.now()}${booking.id.substring(0, 5)}`;
      
      const payload: Record<string, unknown> = {
        merchantId: merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: booking.memberId,
        amount: Math.round(amountDue * 100),
        redirectUrl: `${origin || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/client/v1/payments/phonepe-redirect?bookingId=${booking.id}${origin ? `&origin=${encodeURIComponent(origin)}` : ''}`,
        redirectMode: "POST",
        callbackUrl: `${origin || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/client/v1/payments/webhook?gateway=PHONEPE&bookingId=${booking.id}`,
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
            gateway: 'PHONEPE',
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

    throw new ApiError('Invalid gateway selected', 400);
  }

  /**
   * Atomically verifies slot capacity before confirming a booking on payment callback.
   * If slot was claimed or booking was cancelled, auto-refunds the payment to the member's wallet.
   */
  static async settleSuccessfulPayment(params: SettlePaymentParams): Promise<SettlePaymentResult> {
    return await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: params.bookingId },
        include: { turf: true, sport: true, member: true }
      });

      if (!booking) {
        throw new ApiError('Booking not found', 404);
      }

      // 1. Idempotency check: Booking already settled
      if (booking.paymentStatus === 'PAID') {
        logger.info('Payment already settled for booking', { bookingId: booking.id });

        // Update any matching PENDING transaction so it doesn't remain stranded
        if (params.gatewayOrderId) {
          const pendingTransactions = await tx.transaction.findMany({
            where: {
              gatewayOrderId: params.gatewayOrderId,
              status: 'PENDING'
            }
          });

          for (const pendingTx of pendingTransactions) {
            let existingMeta: Record<string, unknown> = {};
            try {
              existingMeta = JSON.parse(pendingTx.metadata || '{}');
            } catch {
              existingMeta = {};
            }

            await tx.transaction.update({
              where: { id: pendingTx.id },
              data: {
                status: 'SUCCESS',
                gatewayPaymentId: params.gatewayPaymentId || pendingTx.gatewayPaymentId,
                gatewaySignature: params.gatewaySignature || pendingTx.gatewaySignature,
                errorMessage: null,
                metadata: JSON.stringify({
                  ...existingMeta,
                  verifiedAt: new Date().toISOString(),
                  note: 'Settled via concurrent request (idempotent)',
                  ...params.metadata
                })
              }
            });
          }
        }

        return { success: true, status: 'ALREADY_PAID', booking };
      }

      // 2. Check if booking was previously marked CANCELLED by auto-cleanup
      const isAlreadyCancelled = booking.status === 'CANCELLED';

      // 3. Verify turf slot capacity
      const overlapping = await tx.booking.findMany({
        where: {
          turfId: booking.turfId,
          id: { not: booking.id },
          status: { not: 'CANCELLED' },
          startTime: { lt: booking.endTime },
          endTime: { gt: booking.startTime },
          OR: [
            { status: { in: ['CONFIRMED', 'COMPLETED'] } },
            {
              status: 'PAYMENT_PENDING',
              createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) }
            }
          ]
        }
      });

      const usedCapacity = overlapping.reduce((sum, b) => sum + (b.participantCount || 1), 0);
      const capacityAvailable = (booking.turf.capacityPerSlot - usedCapacity) >= (booking.participantCount || 1);

      // ------------------------------------------------------------------------
      // CASE A: OVERBOOKED OR CANCELLED -> AUTO-REFUND TO MEMBER WALLET
      // ------------------------------------------------------------------------
      if (isAlreadyCancelled || !capacityAvailable) {
        logger.warn('Late payment received for overbooked or cancelled slot. Executing auto-refund to wallet.', {
          bookingId: booking.id,
          isAlreadyCancelled,
          capacityAvailable,
          usedCapacity,
          capacityPerSlot: booking.turf.capacityPerSlot
        });

        // If booking was still PAYMENT_PENDING, initial advance was not yet refunded.
        // If booking was CANCELLED, initial advance was already refunded by cleanup.
        const initialAdvanceToRefund = isAlreadyCancelled ? 0 : booking.advancePaid;
        const totalRefundRupees = initialAdvanceToRefund + params.paidAmountRupees;
        const refundPaise = Math.round(totalRefundRupees * 100);

        // Credit full refund to member's wallet balance
        await tx.member.update({
          where: { id: booking.memberId },
          data: { walletBalance: { increment: refundPaise } }
        });

        // Record wallet transaction
        await tx.walletTransaction.create({
          data: {
            memberId: booking.memberId,
            amount: refundPaise,
            type: 'CREDIT',
            description: `Auto-refund: Slot no longer available for booking #${booking.id}`
          }
        });

        // Ensure booking is marked CANCELLED
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED',
            paymentStatus: 'UNPAID',
            amountDue: booking.price,
            advancePaid: 0
          }
        });

        // Log transaction with SUCCESS status but metadata indicating wallet refund
        const existingTx = params.gatewayOrderId
          ? await tx.transaction.findFirst({
              where: { gatewayOrderId: params.gatewayOrderId, gateway: params.gateway }
            })
          : null;

        if (existingTx) {
          await tx.transaction.update({
            where: { id: existingTx.id },
            data: {
              status: 'SUCCESS',
              gatewayPaymentId: params.gatewayPaymentId || existingTx.gatewayPaymentId,
              gatewaySignature: params.gatewaySignature || existingTx.gatewaySignature,
              errorMessage: 'Slot claimed before payment completed. Auto-refunded to wallet.',
              metadata: JSON.stringify({
                ...JSON.parse(existingTx.metadata || '{}'),
                action: 'OVERBOOKED_WALLET_REFUND',
                refundPaise,
                reason: isAlreadyCancelled ? 'BOOKING_CANCELLED' : 'SLOT_UNAVAILABLE',
                ...params.metadata
              })
            }
          });
        } else {
          await tx.transaction.create({
            data: {
              bookingId: booking.id,
              memberId: booking.memberId,
              gateway: params.gateway,
              gatewayOrderId: params.gatewayOrderId || null,
              gatewayPaymentId: params.gatewayPaymentId || null,
              gatewaySignature: params.gatewaySignature || null,
              amount: params.paidAmountRupees,
              currency: 'INR',
              status: 'SUCCESS',
              errorMessage: 'Slot claimed before payment completed. Auto-refunded to wallet.',
              metadata: JSON.stringify({
                action: 'OVERBOOKED_WALLET_REFUND',
                refundPaise,
                reason: isAlreadyCancelled ? 'BOOKING_CANCELLED' : 'SLOT_UNAVAILABLE',
                ...params.metadata
              })
            }
          });
        }

        return {
          success: false,
          status: 'OVERBOOKED_REFUNDED',
          message: 'The slot was claimed before payment completed. The payment has been automatically credited to your wallet.'
        };
      }

      // ------------------------------------------------------------------------
      // CASE B: CAPACITY AVAILABLE -> CONFIRM BOOKING & RECORD PAYMENT
      // ------------------------------------------------------------------------
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          amountDue: 0,
          advancePaid: { increment: params.paidAmountRupees }
        },
        include: { turf: true, sport: true, member: true }
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: params.paidAmountRupees,
          method: 'ONLINE'
        }
      });

      // Award loyalty points upon successful payment settlement
      const pointsEarned = Math.floor(
        Math.max(0, booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0)) * 0.01
      );

      if (pointsEarned > 0) {
        await tx.member.update({
          where: { id: booking.memberId },
          data: { loyaltyPoints: { increment: pointsEarned } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: booking.memberId,
            points: pointsEarned,
            type: 'EARNED',
            source: 'BOOKING',
            description: `Earned from booking ${booking.id}`
          }
        });
      }

      // Update or create Transaction record
      const existingTx = params.gatewayOrderId
        ? await tx.transaction.findFirst({
            where: { gatewayOrderId: params.gatewayOrderId, gateway: params.gateway }
          })
        : null;

      if (existingTx) {
        await tx.transaction.update({
          where: { id: existingTx.id },
          data: {
            status: 'SUCCESS',
            gatewayPaymentId: params.gatewayPaymentId || existingTx.gatewayPaymentId,
            gatewaySignature: params.gatewaySignature || existingTx.gatewaySignature,
            errorMessage: null,
            metadata: JSON.stringify({
              ...JSON.parse(existingTx.metadata || '{}'),
              verifiedAt: new Date().toISOString(),
              ...params.metadata
            })
          }
        });
      } else {
        await tx.transaction.create({
          data: {
            bookingId: booking.id,
            memberId: booking.memberId,
            gateway: params.gateway,
            gatewayOrderId: params.gatewayOrderId || null,
            gatewayPaymentId: params.gatewayPaymentId || null,
            gatewaySignature: params.gatewaySignature || null,
            amount: params.paidAmountRupees,
            currency: 'INR',
            status: 'SUCCESS',
            metadata: JSON.stringify({
              verifiedAt: new Date().toISOString(),
              ...params.metadata
            })
          }
        });
      }

      return { success: true, status: 'PAID', booking: updatedBooking };
    });
  }

  /**
   * Helper to ensure tickets and WhatsApp notifications are sent on confirmed payment.
   */
  static async sendConfirmationAndTickets(booking: any) {
    try {
      if (!booking) return;

      // Generate tickets if not already present
      const existingTickets = await prisma.ticket.count({ where: { bookingId: booking.id } });
      if (existingTickets === 0) {
        const { randomUUID } = require('crypto');
        const ticketsData = [];
        for (let i = 0; i < (booking.participantCount || 1); i++) {
          ticketsData.push({
            bookingId: booking.id,
            qrCode: `TICKET-${randomUUID()}`,
          });
        }
        await prisma.ticket.createMany({ data: ticketsData });
      }

      // Send WhatsApp confirmation
      const { sendWhatsAppBookingConfirmedTemplate } = require('@/lib/whatsapp');
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);

      const formattedDate = start.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' });
      const formattedTime = start.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
      const endFormatted = end.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
      const timeString = `${formattedDate}, ${formattedTime} - ${endFormatted}`;
      const priceStr = `₹${booking.price - (booking.discountAmount || 0)}`;
      const paymentStr = `${priceStr} (PAID)`;

      await sendWhatsAppBookingConfirmedTemplate(
        booking.member.name,
        booking.turf.name,
        booking.sport.name,
        timeString,
        paymentStr,
        booking.member.mobile
      );
    } catch (waError) {
      logger.error('WhatsApp confirmation / ticket generation failed after payment', waError);
    }
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

      const settleResult = await PaymentService.settleSuccessfulPayment({
        bookingId,
        gateway: 'PHONEPE',
        gatewayOrderId: transactionId,
        gatewayPaymentId: providerRef,
        paidAmountRupees: paidAmount,
        metadata: { phonePeResponse: data }
      });

      if (settleResult.success && settleResult.status === 'PAID') {
        await PaymentService.sendConfirmationAndTickets(settleResult.booking);
        return { success: true, status: 'PAID' };
      }

      if (settleResult.status === 'OVERBOOKED_REFUNDED') {
        return {
          success: false,
          status: 'OVERBOOKED_REFUNDED',
          message: settleResult.message
        };
      }

      return { success: true, status: 'PAID' };
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
   * Verifies a Razorpay payment signature, settles booking, and transitions transaction status.
   */
  static async verifyRazorpayPayment(bookingId: string, orderId: string, paymentId: string, signature: string) {
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

    const settleResult = await PaymentService.settleSuccessfulPayment({
      bookingId,
      gateway: 'RAZORPAY',
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      paidAmountRupees: transaction.amount,
      metadata: { orderId, paymentId }
    });

    if (settleResult.success && settleResult.status === 'PAID') {
      await PaymentService.sendConfirmationAndTickets(settleResult.booking);
      return { success: true, status: 'PAID' };
    }

    if (settleResult.status === 'OVERBOOKED_REFUNDED') {
      return {
        success: false,
        status: 'OVERBOOKED_REFUNDED',
        message: settleResult.message
      };
    }

    return { success: true, status: 'PAID' };
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

  /**
   * Cleanup routine to expire abandoned transactions and release slot locks.
   */
  static async expireAbandonedTransactions(timeoutMinutes: number = 15) {
    return await BookingCleanupService.cleanupAbandonedBookings(timeoutMinutes);
  }
}
