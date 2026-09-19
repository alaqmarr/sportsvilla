import { prisma } from "@/core/database/prisma";
import { getISTDateBounds } from "@/core/utils/dateUtils";
import { verifyRazorpayPayment, createRazorpayOrder } from "@/modules/payments/razorpay.services";
import { createPhonePeOrder } from "@/modules/payments/phonepe.services";

export async function getKioskFacilitiesCore() {
  const turfs = await prisma.turf.findMany({
    include: {
      sports: {
        include: { sport: true },
      },
    },
  });

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["FACILITY_OPEN_TIME", "FACILITY_CLOSE_TIME"] } },
  });

  const openTime = settings.find((s) => s.key === "FACILITY_OPEN_TIME")?.value || "06:00";
  const closeTime = settings.find((s) => s.key === "FACILITY_CLOSE_TIME")?.value || "23:00";

  return { turfs: JSON.parse(JSON.stringify(turfs)), openTime, closeTime };
}

export async function fetchKioskAvailableSlotsCore(turfId?: string, durationMin: number = 60) {
  const { start: todayStart, end: todayEnd } = getISTDateBounds();

  const whereClause: any = {
    status: { in: ["CONFIRMED", "PAYMENT_PENDING"] },
    startTime: { gte: todayStart },
    endTime: { lte: todayEnd },
  };
  if (turfId) {
    whereClause.turfId = turfId;
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    select: { startTime: true, endTime: true, turfId: true },
  });

  return JSON.parse(JSON.stringify(bookings));
}

export interface CreateKioskBookingInput {
  memberId: string;
  turfId: string;
  sportId: string;
  startTime: Date;
  endTime: Date;
  price: number;
  paymentMethod: string;
}

export async function createKioskBookingCore(data: CreateKioskBookingInput) {
  const { memberId, turfId, sportId, startTime, endTime, price, paymentMethod } = data;

  const [memberExists, turfExists, sportExists] = await Promise.all([
    prisma.member.findUnique({ where: { id: memberId } }),
    prisma.turf.findUnique({ where: { id: turfId } }),
    prisma.sport.findUnique({ where: { id: sportId } }),
  ]);

  if (!memberExists) throw new Error("Member not found in database. Please refresh.");
  if (!turfExists) throw new Error("Turf not found in database. Please refresh.");
  if (!sportExists) throw new Error("Sport not found in database. Please refresh.");

  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (60 * 1000)));
  const baseSlotMinutes = turfExists.bookingDurationMinutes || 60;
  const expectedPrice = Math.round(((turfExists.bookingPrice || 0) / baseSlotMinutes) * durationMinutes);

  if (Math.round(price) !== expectedPrice) {
    throw new Error(`Price tampering detected. Expected ₹${expectedPrice}, but received ₹${price}.`);
  }
  const validatedPrice = expectedPrice;

  const conflicting = await prisma.booking.findFirst({
    where: {
      turfId,
      status: { in: ["CONFIRMED", "PAYMENT_PENDING"] },
      OR: [{ startTime: { lt: endTime }, endTime: { gt: startTime } }],
    },
  });

  if (conflicting) {
    throw new Error("Time slot is no longer available.");
  }

  if (paymentMethod === "WALLET") {
    const booking = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: memberId } });
      if (!member || member.walletBalance < validatedPrice * 100) {
        throw new Error("Insufficient wallet balance.");
      }

      await tx.member.update({
        where: { id: memberId },
        data: { walletBalance: { decrement: validatedPrice * 100 } },
      });

      await tx.walletTransaction.create({
        data: {
          memberId,
          amount: validatedPrice * 100,
          type: "DEBIT",
          description: `Kiosk booking for ${new Date(startTime).toLocaleString()}`,
        },
      });

      const b = await tx.booking.create({
        data: {
          memberId,
          turfId,
          sportId,
          startTime,
          endTime,
          price: validatedPrice,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          amountDue: 0,
          participants: {
            create: {
              memberId,
              status: "CONFIRMED",
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          bookingId: b.id,
          amount: validatedPrice,
          method: "WALLET",
        },
      });

      await tx.transaction.create({
        data: {
          bookingId: b.id,
          memberId: memberId,
          amount: validatedPrice,
          currency: "INR",
          gateway: "WALLET",
          status: "SUCCESS",
        },
      });

      await tx.ticket.create({
        data: {
          bookingId: b.id,
          qrCode: `kiosk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          guestName: member.name,
          status: "CHECKED_IN",
          usedAt: new Date(),
        },
      });

      return b;
    });

    return {
      type: "WALLET" as const,
      booking,
      validatedPrice,
      turfName: turfExists.name,
      sportName: sportExists.name,
    };
  }

  if (paymentMethod === "PHONEPE") {
    const b = await prisma.booking.create({
      data: {
        memberId,
        turfId,
        sportId,
        startTime,
        endTime,
        price: validatedPrice,
        status: "PAYMENT_PENDING",
        paymentStatus: "UNPAID",
        amountDue: validatedPrice,
        participants: {
          create: {
            memberId,
            status: "CONFIRMED",
          },
        },
      },
    });

    const orderData = await createPhonePeOrder(b, "WEB", undefined, "/admin/nfc/kiosk");
    return {
      type: "PHONEPE" as const,
      booking: b,
      validatedPrice,
      orderData,
      turfName: turfExists.name,
      sportName: sportExists.name,
    };
  }

  if (paymentMethod === "RAZORPAY") {
    const b = await prisma.booking.create({
      data: {
        memberId,
        turfId,
        sportId,
        startTime,
        endTime,
        price: validatedPrice,
        status: "PAYMENT_PENDING",
        paymentStatus: "UNPAID",
        amountDue: validatedPrice,
        participants: {
          create: {
            memberId,
            status: "CONFIRMED",
          },
        },
      },
    });

    const orderData = await createRazorpayOrder(b, "WEB");
    return {
      type: "RAZORPAY" as const,
      booking: b,
      validatedPrice,
      orderData,
      turfName: turfExists.name,
      sportName: sportExists.name,
    };
  }

  throw new Error("Invalid payment method");
}

export async function confirmKioskRazorpayPaymentCore(
  bookingId: string,
  memberId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  await verifyRazorpayPayment(
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  const updated = await prisma.ticket.updateMany({
    where: { bookingId, status: "VALID" },
    data: {
      status: "CHECKED_IN",
      usedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    await prisma.ticket.create({
      data: {
        bookingId: bookingId,
        qrCode: `kiosk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        guestName: member?.name || "Member",
        status: "CHECKED_IN",
        usedAt: new Date(),
      },
    });
  }

  return { success: true };
}

export async function findMembersByMobileCore(mobile: string) {
  const members = await prisma.member.findMany({
    where: { mobile },
    select: {
      id: true,
      name: true,
      mobile: true,
      walletBalance: true,
      family: {
        include: {
          members: {
            select: {
              id: true,
              name: true,
              mobile: true,
              walletBalance: true,
            },
          },
        },
      },
    },
  });

  return JSON.parse(JSON.stringify(members));
}
