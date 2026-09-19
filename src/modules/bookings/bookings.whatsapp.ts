import { sendWhatsAppBookingConfirmedTemplate } from "@/modules/whatsapp/booking-confirmation.template";
import { sendWhatsAppBookingCancelledTemplate } from "@/modules/whatsapp/booking-cancellation.template";
import { formatWhatsAppNumber } from "@/modules/whatsapp/whatsapp.service";
import { formatBookingISTDateTime } from "./bookings.helper";


export interface BookingConfirmedWhatsAppParams {
  bookingId: string;
  customerName: string;
  turfName: string;
  sportName: string;
  startTime: Date | string;
  endTime: Date | string;
  price: number;
  discountAmount?: number | null;
  paymentStatus: string;
  mobile: string;
}

export interface BookingCancelledWhatsAppParams {
  customerName: string;
  turfName: string;
  startTime: Date | string;
  refundAmountRupees: number;
  mobile: string;
}

export async function dispatchBookingConfirmedWhatsApp(
  params: BookingConfirmedWhatsAppParams,
) {
  const {
    bookingId,
    customerName,
    turfName,
    sportName,
    startTime,
    endTime,
    price,
    discountAmount = 0,
    paymentStatus,
    mobile,
  } = params;

  if (!mobile) return null;

  const { timeString } = formatBookingISTDateTime(startTime, endTime);
  const netAmount = Math.round(price - (discountAmount || 0));
  const priceStr = `₹${netAmount}`;
  const paymentStr =
    paymentStatus === "UNPAID"
      ? `${priceStr} (DUE)`
      : `${priceStr} (${paymentStatus})`;

  return await sendWhatsAppBookingConfirmedTemplate(
    bookingId,
    customerName,
    turfName,
    sportName,
    timeString,
    paymentStr,
    mobile,
  );
}

export async function dispatchBookingCancelledWhatsApp(
  params: BookingCancelledWhatsAppParams,
) {
  const { customerName, turfName, startTime, refundAmountRupees, mobile } =
    params;

  if (!mobile) return null;

  const formattedTime = new Date(startTime).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });

  return await sendWhatsAppBookingCancelledTemplate(
    customerName,
    turfName || "Sportsvilla",
    formattedTime,
    refundAmountRupees,
    mobile,
  );
}

export async function sendBookingConfirmationWhatsApp(booking: {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  price: number;
  discountAmount?: number | null;
  paymentStatus: string;
  member?: { name: string; mobile: string | null } | null;
  turf?: { name: string } | null;
  sport?: { name: string } | null;
}) {
  if (!booking.member?.mobile) return null;

  return await dispatchBookingConfirmedWhatsApp({
    bookingId: booking.id,
    customerName: booking.member.name,
    turfName: booking.turf?.name || "Turf",
    sportName: booking.sport?.name || "Sports",
    startTime: booking.startTime,
    endTime: booking.endTime,
    price: booking.price,
    discountAmount: booking.discountAmount,
    paymentStatus: booking.paymentStatus,
    mobile: booking.member.mobile,
  });
}

export async function sendBookingCancellationWhatsApp(
  booking: {
    startTime: Date | string;
    member?: { name: string; mobile: string | null } | null;
    turf?: { name: string } | null;
  },
  refundAmountRupees: number,
) {
  if (!booking.member?.mobile) return null;

  return await dispatchBookingCancelledWhatsApp({
    customerName: booking.member.name,
    turfName: booking.turf?.name || "Sportsvilla",
    startTime: booking.startTime,
    refundAmountRupees,
    mobile: booking.member.mobile,
  });
}
