/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdminActorInfo } from "./booking-creation.lib";

export interface RescheduleBookingResult {
  booking: any;
  calculatedPrice: number;
}

export async function rescheduleBookingCore(
  tx: any,
  id: string,
  newTurfId: string,
  newStartTime: Date,
  newEndTime: Date,
  adminInfo?: AdminActorInfo,
): Promise<RescheduleBookingResult> {
  const booking = await tx.booking.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED")
    throw new Error("Cannot reschedule a cancelled booking");

  const newTurf = await tx.turf.findUnique({ where: { id: newTurfId } });
  if (!newTurf) throw new Error("Turf not found");

  const overlappingBookings = await tx.booking.findMany({
    where: {
      id: { not: id },
      turfId: newTurfId,
      status: { not: "CANCELLED" },
      startTime: { lt: newEndTime },
      endTime: { gt: newStartTime },
    },
  });

  const usedCapacity = overlappingBookings.reduce(
    (sum: number, b: any) => sum + (b.participantCount || 0),
    0,
  );
  if (
    (booking.participantCount || 1) >
    newTurf.capacityPerSlot - usedCapacity
  ) {
    throw new Error("The selected slot does not have enough capacity.");
  }

  const durationMinutes =
    (new Date(newEndTime).getTime() - new Date(newStartTime).getTime()) / 60000;
  const baseSlotMinutes = newTurf.bookingDurationMinutes || 60;
  const pricePerMinute =
    (newTurf.bookingPrice != null
      ? newTurf.bookingPrice
      : booking.price / (durationMinutes || 60)) / baseSlotMinutes;
  const calculatedPrice =
    newTurf.bookingPrice != null
      ? Math.round(
          pricePerMinute * durationMinutes * (booking.participantCount || 1),
        )
      : booking.price;

  const totalPaid = booking.payments.reduce(
    (sum: number, p: any) => sum + p.amount,
    0,
  );
  const netPrice = Math.max(0, calculatedPrice - (booking.discountAmount || 0));
  const newStatus =
    totalPaid >= netPrice ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";
  const newAmountDue = Math.max(0, netPrice - totalPaid);

  const updatedBooking = await tx.booking.update({
    where: { id },
    data: {
      turfId: newTurfId,
      startTime: new Date(newStartTime),
      endTime: new Date(newEndTime),
      price: calculatedPrice,
      amountDue: newAmountDue,
      paymentStatus: newStatus,
    },
  });

  await tx.auditLog.create({
    data: {
      action: "RESCHEDULE_BOOKING",
      entity: "Booking",
      entityId: id,
      details: JSON.stringify({
        oldTurfId: booking.turfId,
        newTurfId,
        oldStartTime: booking.startTime,
        newStartTime,
        oldEndTime: booking.endTime,
        newEndTime,
        oldPrice: booking.price,
        newPrice: calculatedPrice,
      }),
      adminId: adminInfo?.adminId,
      adminName: adminInfo?.adminName || "System",
    },
  });

  return { booking: updatedBooking, calculatedPrice };
}
