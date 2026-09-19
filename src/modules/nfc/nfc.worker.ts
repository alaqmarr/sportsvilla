import { sendWalletTransactionPush, sendBookingConfirmedPush } from "@/modules/notifications/notifications.services";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { logger } from "@/core/logging/logger";

export async function dispatchNfcWalletPush(
  userId: string,
  amount: number,
  type: "CREDIT" | "DEBIT",
  description: string
) {
  sendWalletTransactionPush(userId, amount, type, description).catch((pushErr) => {
    logger.error("[Push Hook Error] NFC wallet push notification failed", pushErr);
  });
}

export async function dispatchKioskBookingConfirmedPush(booking: {
  id: string;
  memberId: string;
  turfName: string;
  sportName: string;
  startTime: Date;
  endTime: Date;
}) {
  sendBookingConfirmedPush({
    id: booking.id,
    memberId: booking.memberId,
    turf: { name: booking.turfName },
    sport: { name: booking.sportName },
    startTime: booking.startTime,
    endTime: booking.endTime,
  }).catch((err) => {
    logger.error("[Push Hook Error] Kiosk booking confirmed push failed", err);
  });
}

export async function bumpNfcSync() {
  await bumpSyncTimestamp("nfc");
}
