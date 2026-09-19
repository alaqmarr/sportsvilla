/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/core/database/prisma";
import { Prisma } from "@/generated/client";
import { formatIST } from "@/core/utils/dateUtils";
import {
  calculateNetPrice,
  calculatePaymentStatusAndDue,
  generateTicketQrCode,
  mergeExtensionAllocations,
  ExtensionAllocationItem,
} from "../bookings.helper";

export interface ExtensionPreviewResult {
  available: boolean;
  allocations?: ExtensionAllocationItem[];
  totalPrice?: number;
  message?: string;
}

export async function previewExtensionCore(
  bookingId: string,
  durationMinutes: number,
): Promise<ExtensionPreviewResult> {
  if (durationMinutes <= 0 || durationMinutes % 30 !== 0) {
    throw new Error("Duration must be a multiple of 30 minutes.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { turf: true },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED")
    throw new Error("Cannot extend cancelled booking");

  const applicableTurfs = await prisma.turf.findMany({
    where: {
      sports: { some: { sportId: booking.sportId } },
      bookingPrice: { not: null },
    },
  });

  const numChunks = durationMinutes / 30;
  let currentStartTime = booking.endTime;
  const allocations: ExtensionAllocationItem[] = [];

  for (let i = 0; i < numChunks; i++) {
    const chunkEndTime = new Date(currentStartTime.getTime() + 30 * 60000);

    let assignedTurf = null;
    let isSameCourt = false;

    const conflictOnCurrent = await prisma.booking.findFirst({
      where: {
        turfId: booking.turfId,
        status: { not: "CANCELLED" },
        startTime: { lt: chunkEndTime },
        endTime: { gt: currentStartTime },
      },
    });

    if (!conflictOnCurrent) {
      assignedTurf = applicableTurfs.find((t) => t.id === booking.turfId);
      isSameCourt = true;
    } else {
      for (const altTurf of applicableTurfs) {
        if (altTurf.id === booking.turfId) continue;
        const altConflict = await prisma.booking.findFirst({
          where: {
            turfId: altTurf.id,
            status: { not: "CANCELLED" },
            startTime: { lt: chunkEndTime },
            endTime: { gt: currentStartTime },
          },
        });
        if (!altConflict) {
          assignedTurf = altTurf;
          break;
        }
      }
    }

    if (!assignedTurf) {
      return {
        available: false,
        message: `Could not find courts for the full ${durationMinutes} mins. Failed at ${formatIST(
          currentStartTime,
          "h:mm a",
        )}.`,
      };
    }

    const priceFor30m =
      ((assignedTurf.bookingPrice || 0) /
        (assignedTurf.bookingDurationMinutes || 60)) *
      30;

    allocations.push({
      turfId: assignedTurf.id,
      turfName: assignedTurf.name,
      startTime: currentStartTime.toISOString(),
      endTime: chunkEndTime.toISOString(),
      price: priceFor30m,
      isSameCourt,
    });

    currentStartTime = chunkEndTime;
  }

  const mergedAllocations = mergeExtensionAllocations(allocations);

  return {
    available: true,
    allocations: mergedAllocations,
    totalPrice: mergedAllocations.reduce((sum, a) => sum + a.price, 0),
  };
}

export async function confirmExtensionCore(
  tx: any,
  bookingId: string,
  allocations: any[],
) {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) throw new Error("Booking not found");

  for (const alloc of allocations) {
    const conflict = await tx.booking.findFirst({
      where: {
        turfId: alloc.turfId,
        status: { not: "CANCELLED" },
        startTime: { lt: new Date(alloc.endTime) },
        endTime: { gt: new Date(alloc.startTime) },
        id: { not: bookingId },
      },
    });
    if (conflict)
      throw new Error(`Slot no longer available for ${alloc.turfName}`);

    if (
      alloc.isSameCourt &&
      alloc.startTime === booking.endTime.toISOString()
    ) {
      const totalPaid = (
        await tx.payment.findMany({ where: { bookingId } })
      ).reduce((s: number, p: any) => s + p.amount, 0);
      const newPrice = booking.price + alloc.price;
      const netPayable = calculateNetPrice(
        newPrice,
        booking.discountAmount,
        booking.pointsRedeemed,
      );
      const { paymentStatus: newStatus, amountDue } =
        calculatePaymentStatusAndDue(netPayable, totalPaid);

      await tx.booking.update({
        where: { id: bookingId },
        data: {
          endTime: new Date(alloc.endTime),
          price: newPrice,
          paymentStatus: newStatus,
          amountDue,
        },
      });

      booking.price = newPrice;
      booking.endTime = new Date(alloc.endTime);
    } else {
      await tx.booking.create({
        data: {
          turfId: alloc.turfId,
          memberId: booking.memberId,
          sportId: booking.sportId,
          startTime: new Date(alloc.startTime),
          endTime: new Date(alloc.endTime),
          price: alloc.price,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
          amountDue: alloc.price,
          participantCount: booking.participantCount,
          tickets: {
            create: Array.from({ length: booking.participantCount }).map(
              () => ({
                qrCode: generateTicketQrCode(),
              }),
            ),
          },
        },
      });
    }
  }

  return { success: true };
}
