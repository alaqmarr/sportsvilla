import { eventBus } from "@/core/events/event-bus";
import { logger } from "@/core/logging/logger";
import {
  sendBookingConfirmedPush,
  sendWalletTransactionPush,
  sendMembershipPush,
} from "@/modules/notifications/notifications.services";

export function registerNotificationListeners(): void {
  eventBus.on("booking.confirmed", async (payload) => {
    try {
      await sendBookingConfirmedPush({
        id: payload.bookingId,
        memberId: payload.memberId,
        turf: { name: payload.turfName },
        sport: { name: payload.sportName },
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
    } catch (err) {
      logger.error("[Push Listener Error] booking.confirmed failed:", err);
    }
  });

  eventBus.on("wallet.credited", async (payload) => {
    try {
      await sendWalletTransactionPush(
        payload.memberId,
        payload.rechargeAmount,
        "CREDIT",
        payload.description || (payload.reason === "REFUND" ? `Refund for booking ${payload.bookingId || ""}` : `Wallet credited ₹${payload.rechargeAmount}`)
      );
    } catch (err) {
      logger.error("[Push Listener Error] wallet.credited failed:", err);
    }
  });

  eventBus.on("wallet.debited", async (payload) => {
    try {
      await sendWalletTransactionPush(
        payload.memberId,
        payload.amount,
        "DEBIT",
        payload.description || `Wallet debited ₹${payload.amount}`
      );
    } catch (err) {
      logger.error("[Push Listener Error] wallet.debited failed:", err);
    }
  });

  eventBus.on("membership.assigned", async (payload) => {
    try {
      await sendMembershipPush(
        payload.memberId,
        payload.planName,
        payload.actionType || "ASSIGNED"
      );
    } catch (err) {
      logger.error("[Push Listener Error] membership.assigned failed:", err);
    }
  });
}
