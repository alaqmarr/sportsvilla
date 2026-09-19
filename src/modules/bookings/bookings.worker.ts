import {
  sendBookingConfirmedPush,
  sendWalletTransactionPush,
} from "@/modules/notifications/notifications.services";
import { bumpSyncTimestamp } from "@/core/database/sync";
import { logger } from "@/core/logging/logger";
import { generateTicketQrCode } from "./bookings.helper";

export interface BookingConfirmedPushParams {
  id: string;
  memberId: string;
  turfName: string;
  sportName: string;
  startTime: Date | string;
  endTime: Date | string;
}

export async function dispatchBookingConfirmedPushNotification(
  params: BookingConfirmedPushParams,
): Promise<void> {
  try {
    await sendBookingConfirmedPush({
      id: params.id,
      memberId: params.memberId,
      turf: { name: params.turfName },
      sport: { name: params.sportName },
      startTime: new Date(params.startTime),
      endTime: new Date(params.endTime),
    });
  } catch (err) {
    logger.error(
      "[Push Hook Error] Admin booking push notification failed",
      err,
    );
  }
}

export async function dispatchRefundPushNotification(
  memberId: string,
  refundAmountRupees: number,
  bookingId: string,
): Promise<void> {
  try {
    await sendWalletTransactionPush(
      memberId,
      refundAmountRupees,
      "CREDIT",
      `Refund for cancelled booking ${bookingId}`,
    );
  } catch (err) {
    logger.error(
      "[Push Hook Error] Admin cancel booking refund push failed",
      err,
    );
  }
}

export async function bumpBookingSyncTimestamp(
  tag: string = "admin_booking",
): Promise<void> {
  try {
    await bumpSyncTimestamp(tag);
  } catch (err) {
    logger.warn(
      `[Sync Warning] Failed to bump sync timestamp for ${tag}:`,
      err,
    );
  }
}

export function buildTicketsForMember(params: {
  isPrimary: boolean;
  nonFamilyGuestCount: number;
  nonFamilyGuestNames?: string[];
}): { qrCode: string; guestName: string | null }[] {
  const { isPrimary, nonFamilyGuestCount, nonFamilyGuestNames = [] } = params;

  const tickets: { qrCode: string; guestName: string | null }[] = [
    {
      qrCode: generateTicketQrCode(),
      guestName: null,
    },
  ];

  if (isPrimary && nonFamilyGuestCount > 0) {
    for (let g = 0; g < nonFamilyGuestCount; g++) {
      tickets.push({
        qrCode: generateTicketQrCode(),
        guestName: nonFamilyGuestNames[g] || null,
      });
    }
  }

  return tickets;
}
