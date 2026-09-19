import { eventBus } from "@/core/events/event-bus";
import { logger } from "@/core/logging/logger";
import {
  dispatchBookingConfirmedWhatsApp,
  dispatchBookingCancelledWhatsApp,
} from "@/modules/bookings/bookings.whatsapp";
import { dispatchWalletCreditWhatsApp } from "@/modules/wallets/wallets.whatsapp";
import { dispatchAttendanceWhatsApp } from "@/modules/attendance/attendance.whatsapp";
import { dispatchCheckinWhatsApp } from "@/modules/checkin/checkin.whatsapp";
import {
  dispatchMemberRegisteredWhatsApp,
  dispatchMembershipPurchasedWhatsApp,
  dispatchMembershipExpiringWhatsApp,
} from "@/modules/members/members.whatsapp";

export function registerWhatsAppListeners(): void {
  eventBus.on("booking.confirmed", async (payload) => {
    try {
      if (!payload.mobile) return;
      await dispatchBookingConfirmedWhatsApp({
        bookingId: payload.bookingId,
        customerName: payload.customerName,
        turfName: payload.turfName,
        sportName: payload.sportName,
        startTime: payload.startTime,
        endTime: payload.endTime,
        price: payload.price,
        discountAmount: payload.discountAmount,
        paymentStatus: payload.paymentStatus,
        mobile: payload.mobile,
      });
    } catch (err) {
      logger.error("[WhatsApp Listener Error] booking.confirmed failed:", err);
    }
  });

  eventBus.on("booking.cancelled", async (payload) => {
    try {
      if (!payload.mobile) return;
      await dispatchBookingCancelledWhatsApp({
        customerName: payload.customerName,
        turfName: payload.turfName,
        startTime: payload.startTime,
        refundAmountRupees: payload.refundAmountRupees,
        mobile: payload.mobile,
      });
    } catch (err) {
      logger.error("[WhatsApp Listener Error] booking.cancelled failed:", err);
    }
  });

  eventBus.on("wallet.credited", async (payload) => {
    try {
      if (!payload.mobile) return;
      const memberName = payload.memberName || payload.customerName || "Member";
      const newBalance = payload.newBalance ?? payload.rechargeAmount;
      await dispatchWalletCreditWhatsApp(
        memberName,
        payload.rechargeAmount,
        newBalance,
        payload.mobile
      );
    } catch (err) {
      logger.error("[WhatsApp Listener Error] wallet.credited failed:", err);
    }
  });

  eventBus.on("attendance.marked", async (payload) => {
    try {
      if (!payload.mobile) return;
      await dispatchAttendanceWhatsApp(
        payload.memberName,
        payload.sportName,
        payload.mobile
      );
    } catch (err) {
      logger.error("[WhatsApp Listener Error] attendance.marked failed:", err);
    }
  });

  eventBus.on("checkin.confirmed", async (payload) => {
    try {
      if (!payload.mobile) return;
      await dispatchCheckinWhatsApp(
        payload.memberName,
        payload.sportName,
        payload.mobile
      );
    } catch (err) {
      logger.error("[WhatsApp Listener Error] checkin.confirmed failed:", err);
    }
  });

  eventBus.on("membership.assigned", async (payload) => {
    try {
      if (!payload.mobile) return;
      await dispatchMembershipPurchasedWhatsApp({
        memberName: payload.memberName,
        planName: payload.planName,
        turfName: payload.turfName || "Sports Villa",
        eligibleSlot: payload.eligibleSlot || "Any open slot",
        validUntil: payload.validUntil || "",
        mobile: payload.mobile,
      });
    } catch (err) {
      logger.error("[WhatsApp Listener Error] membership.assigned failed:", err);
    }
  });

  eventBus.on("membership.expired", async (payload) => {
    try {
      const mobile = payload.mobile || payload.registeredPhone;
      if (!mobile) return;
      await dispatchMembershipExpiringWhatsApp({
        mobile,
        customerName: payload.customerName,
        planName: payload.planName,
        expirationDate: payload.expirationDate,
        registeredPhone: mobile,
      });
    } catch (err) {
      logger.error("[WhatsApp Listener Error] membership.expired failed:", err);
    }
  });

  eventBus.on("member.registered", async (payload) => {
    try {
      if (!payload.mobile) return;
      await dispatchMemberRegisteredWhatsApp(payload.name, payload.mobile);
    } catch (err) {
      logger.error("[WhatsApp Listener Error] member.registered failed:", err);
    }
  });
}
