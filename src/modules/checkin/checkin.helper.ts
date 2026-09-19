import { formatIST, getISTDateBounds } from "@/core/utils/dateUtils";

export function validateTicketTiming(
  bookingStartTime: Date,
  validityDays: number
): { valid: boolean; error?: string } {
  const now = new Date();
  const startTime = new Date(bookingStartTime);

  const bookingDateStr = formatIST(bookingStartTime, "yyyy-MM-dd");
  const { end: bookingDayEnd } = getISTDateBounds(bookingDateStr);

  const validityEnd = new Date(bookingDayEnd.getTime());
  if (validityDays > 0) {
    validityEnd.setDate(validityEnd.getDate() + validityDays);
  }

  // Allow check-in 1 hour before start time
  const earlyAllowTime = new Date(startTime.getTime() - 60 * 60000);

  if (now < earlyAllowTime) {
    return {
      valid: false,
      error: "Too early to check-in. Booking starts at " + formatIST(startTime, "h:mm a"),
    };
  }

  if (now > validityEnd) {
    return {
      valid: false,
      error: "Ticket has expired.",
    };
  }

  return { valid: true };
}
