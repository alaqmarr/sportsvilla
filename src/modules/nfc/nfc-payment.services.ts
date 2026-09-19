import { prisma } from "@/core/database/prisma";
import { Mutex } from "@/core/utils/mutex";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { NfcPaymentRequest, NfcPaymentResponse, NfcDeviceType } from "@/types/nfc";
import { normalizeCardUid } from "@/hooks/useNfcReader";
import { randomUUID } from "crypto";
import { sendWalletTransactionPush, sendBookingConfirmedPush } from "@/modules/notifications/notifications.services";
import { logger } from "@/core/logging/logger";

export interface ProcessPaymentOptions extends NfcPaymentRequest {
  location?: string;
}

export class NfcPaymentService {
  /**
   * Processes an NFC card payment by deducting the mapped member's wallet balance in paise
   * and updating the booking (if provided) to PAID/PARTIAL along with Payment and Ticket creation.
   *
   * Protected with Mutex concurrency locking to prevent race conditions and physical double-taps.
   */
  static async processPayment(params: ProcessPaymentOptions): Promise<NfcPaymentResponse> {
    const rawUid = params.cardUid || "";
    const cardUid = normalizeCardUid(rawUid);
    const deviceType: NfcDeviceType = params.deviceType || "KEYBOARD_WEDGE";
    const location = params.location || "FRONT_DESK";
    const amountRupees = Number(params.amount);

    if (!cardUid || cardUid.length < 4) {
      return {
        success: false,
        error: "INVALID_CARD_UID",
        code: "INVALID_CARD_UID",
        message: "Invalid card UID provided.",
      };
    }

    if (isNaN(amountRupees) || amountRupees <= 0) {
      return {
        success: false,
        error: "INVALID_AMOUNT",
        code: "INVALID_AMOUNT",
        message: "Payment amount must be greater than zero.",
      };
    }

    const amountPaise = Math.round(amountRupees * 100);

    // 1. Concurrency locking using Mutex
    const acquired = await Mutex.acquire(`nfc:pay:${cardUid}`, 5000);
    if (!acquired) {
      return {
        success: false,
        error: "CONCURRENCY_LOCK_ACTIVE",
        code: "CONCURRENCY_LOCK_ACTIVE",
        message: "Payment operation already in progress for this card. Please wait.",
      };
    }

    try {
      // 2. Lookup NfcCard and mapped Member
      const card = await prisma.nfcCard.findUnique({
        where: { cardUid },
        include: {
          member: true,
        },
      });

      // Rejection Check 1: Card not found in DB
      if (!card) {
        const failedTx = await prisma.nfcTransaction.create({
          data: {
            cardUid,
            bookingId: params.bookingId || null,
            type: "PAYMENT",
            status: "FAILED",
            amount: amountRupees,
            deviceType,
            readerLocation: location,
            failureReason: "CARD_NOT_FOUND",
            metadata: JSON.stringify({ reason: "Card UID not found in database" }),
          },
        });

        return {
          success: false,
          transactionId: failedTx.id,
          deductedAmount: 0,
          remainingBalance: 0,
          error: "CARD_NOT_FOUND",
          code: "CARD_NOT_FOUND",
          message: "Unregistered card. Please register this card at the front desk.",
        };
      }

      // Rejection Check 2: Card status not ACTIVE
      if (card.status !== "ACTIVE") {
        const failureReason = `CARD_${card.status}`;
        const failedTx = await prisma.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            memberId: card.memberId,
            bookingId: params.bookingId || null,
            type: "PAYMENT",
            status: "FAILED",
            amount: amountRupees,
            deviceType,
            readerLocation: location,
            failureReason,
            metadata: JSON.stringify({ cardStatus: card.status }),
          },
        });

        return {
          success: false,
          transactionId: failedTx.id,
          deductedAmount: 0,
          remainingBalance: card.member ? Number((card.member.walletBalance / 100).toFixed(2)) : 0,
          member: card.member
            ? {
                id: card.member.id,
                name: card.member.name,
                mobile: card.member.mobile,
              }
            : undefined,
          error: failureReason,
          code: failureReason,
          message: `Card is ${card.status.toLowerCase()}. Please contact front desk.`,
        };
      }

      // Rejection Check 3: Card not assigned to a member
      if (!card.memberId || !card.member) {
        const failedTx = await prisma.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            bookingId: params.bookingId || null,
            type: "PAYMENT",
            status: "FAILED",
            amount: amountRupees,
            deviceType,
            readerLocation: location,
            failureReason: "NO_MEMBER_ASSIGNED",
            metadata: JSON.stringify({ reason: "Card has no linked member" }),
          },
        });

        return {
          success: false,
          transactionId: failedTx.id,
          deductedAmount: 0,
          remainingBalance: 0,
          error: "NO_MEMBER_ASSIGNED",
          code: "NO_MEMBER_ASSIGNED",
          message: "Card is not assigned to any member.",
        };
      }

      const member = card.member;

      // Rejection Check 4: Insufficient wallet balance
      if (member.walletBalance < amountPaise) {
        const failedTx = await prisma.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            memberId: member.id,
            bookingId: params.bookingId || null,
            type: "PAYMENT",
            status: "FAILED",
            amount: amountRupees,
            deviceType,
            readerLocation: location,
            failureReason: "INSUFFICIENT_FUNDS",
            metadata: JSON.stringify({
              requiredPaise: amountPaise,
              availablePaise: member.walletBalance,
            }),
          },
        });

        return {
          success: false,
          transactionId: failedTx.id,
          deductedAmount: 0,
          remainingBalance: Number((member.walletBalance / 100).toFixed(2)),
          member: {
            id: member.id,
            name: member.name,
            mobile: member.mobile,
          },
          error: "INSUFFICIENT_FUNDS",
          code: "INSUFFICIENT_FUNDS",
          message: `Insufficient wallet balance. Required: ₹${amountRupees.toFixed(2)}, Available: ₹${(member.walletBalance / 100).toFixed(2)}`,
        };
      }

      // 3. Description
      const description =
        params.description ||
        (params.bookingId
          ? `NFC Card Payment for booking ${params.bookingId}`
          : `NFC Card Payment`);

      // 4. Atomic Execution inside prisma.$transaction
      const transactionResult = await prisma.$transaction(async (tx) => {
        // Safe check and debit member walletBalance in paise
        const updatedMember = await tx.member.update({
          where: { id: member.id },
          data: {
            walletBalance: { decrement: amountPaise },
          },
        });

        if (updatedMember.walletBalance < 0) {
          throw new Error("INSUFFICIENT_FUNDS");
        }

        // Create WalletTransaction record
        await tx.walletTransaction.create({
          data: {
            memberId: member.id,
            amount: amountPaise,
            type: "DEBIT",
            description,
          },
        });

        // Booking-specific updates
        let bookingRecord: any = null;
        if (params.bookingId) {
          bookingRecord = await tx.booking.findUnique({
            where: { id: params.bookingId },
            include: { payments: true, tickets: true }
          });
          if (!bookingRecord) throw new Error("BOOKING_NOT_FOUND");
          if (bookingRecord.status === "CANCELLED") throw new Error("BOOKING_CANCELLED");
        }

        if (params.bookingId && bookingRecord) {
          // Create Payment record
          await tx.payment.create({
            data: {
              bookingId: params.bookingId,
              amount: amountRupees,
              method: "SPORTSVILLA_CARD",
            },
          });

          // Create Transaction record for ledger consistency
          await tx.transaction.create({
            data: {
              bookingId: params.bookingId,
              memberId: member.id,
              gateway: "WALLET",
              amount: amountRupees,
              status: "SUCCESS",
              metadata: JSON.stringify({
                method: "SPORTSVILLA_CARD",
                cardUid,
              }),
            },
          });

          // Recalculate Booking paymentStatus and amountDue
          const existingPaid = (bookingRecord.payments || []).reduce(
            (sum: number, p: any) => sum + p.amount,
            0
          );
          const totalPaid = existingPaid + amountRupees;
          const netPrice = Math.max(0, bookingRecord.price - (bookingRecord.discountAmount || 0) - (bookingRecord.pointsRedeemed || 0));
          const newPaymentStatus =
            totalPaid >= netPrice ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";
          const newAmountDue = Math.max(0, netPrice - totalPaid);

          await tx.booking.update({
            where: { id: params.bookingId },
            data: {
              advancePaid: { increment: amountRupees },
              amountDue: newAmountDue,
              paymentStatus: newPaymentStatus,
              status: "CONFIRMED",
            },
          });

          // Ensure a valid Ticket exists for the booking
          const existingTicketCount = await tx.ticket.count({
            where: { bookingId: params.bookingId },
          });

          if (existingTicketCount === 0) {
            const count = bookingRecord.participantCount || 1;
            const ticketsData = [];
            for (let i = 0; i < count; i++) {
              ticketsData.push({
                bookingId: params.bookingId,
                qrCode: `TKT-${randomUUID()}`,
                status: "VALID",
              });
            }
            await tx.ticket.createMany({ data: ticketsData });
          }
        }

        // Log successful NfcTransaction
        const nfcTx = await tx.nfcTransaction.create({
          data: {
            cardId: card.id,
            cardUid,
            memberId: member.id,
            bookingId: params.bookingId || null,
            type: "PAYMENT",
            status: "SUCCESS",
            amount: amountRupees,
            deviceType,
            readerLocation: location,
            metadata: JSON.stringify({
              action: "PAYMENT",
              amountRupees,
              amountPaise,
              bookingId: params.bookingId || null,
              description,
            }),
          },
        });

        // Update NfcCard lastUsedAt timestamp
        await tx.nfcCard.update({
          where: { id: card.id },
          data: { lastUsedAt: new Date() },
        });

        return {
          nfcTx,
          updatedMember,
        };
      });

      // 5. Bump LastUpdate timestamp for payments
      await bumpSyncTimestamp("payments");

      // Dispatch push notifications (non-blocking)
      sendWalletTransactionPush(
        member.id,
        amountRupees,
        'DEBIT',
        description
      ).catch((pushErr) => {
        logger.error('[Push Hook Error] NFC payment wallet push failed', pushErr);
      });

      if (params.bookingId) {
        prisma.booking.findUnique({
          where: { id: params.bookingId },
          include: { turf: true, sport: true }
        }).then((b) => {
          if (b && b.paymentStatus === 'PAID') {
            sendBookingConfirmedPush({
              id: b.id,
              memberId: b.memberId,
              turf: b.turf,
              sport: b.sport,
              startTime: b.startTime,
              endTime: b.endTime
            }).catch((err) => {
              logger.error('[Push Hook Error] NFC booking confirmed push failed', err);
            });
          }
        }).catch((err) => {
          logger.error('[Push Hook Error] NFC booking push lookup failed', err);
        });
      }

      return {
        success: true,
        transactionId: transactionResult.nfcTx.id,
        deductedAmount: amountRupees,
        remainingBalance: Number((transactionResult.updatedMember.walletBalance / 100).toFixed(2)),
        member: {
          id: member.id,
          name: member.name,
          mobile: member.mobile,
        },
        bookingId: params.bookingId,
        message: `Payment of ₹${amountRupees.toFixed(2)} completed successfully via SportsVilla Card.`,
      };
    } catch (error: any) {
      console.error("[NfcPaymentService] Payment execution failed:", error);
      return {
        success: false,
        error: error?.message || "PAYMENT_FAILED",
        code: error?.message || "PAYMENT_FAILED",
        message: error?.message === "INSUFFICIENT_FUNDS"
          ? "Insufficient wallet balance."
          : "An error occurred while processing NFC card payment.",
      };
    } finally {
      // 6. Concurrency lock release
      Mutex.release(`nfc:pay:${cardUid}`);
    }
  }
}
