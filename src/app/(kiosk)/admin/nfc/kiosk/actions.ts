"use server";

import { prisma } from "@/lib/prisma";
import { getISTDateBounds } from "@/lib/dateUtils";

export async function getKioskFacilities() {
  const turfs = await prisma.turf.findMany({
    include: {
      sports: {
        include: { sport: true }
      }
    }
  });

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["FACILITY_OPEN_TIME", "FACILITY_CLOSE_TIME"] } }
  });

  const openTime = settings.find(s => s.key === "FACILITY_OPEN_TIME")?.value || "06:00";
  const closeTime = settings.find(s => s.key === "FACILITY_CLOSE_TIME")?.value || "23:00";

  return { turfs: JSON.parse(JSON.stringify(turfs)), openTime, closeTime };
}

export async function fetchKioskAvailableSlots(turfId?: string, durationMin: number = 60) {
  const { start: todayStart, end: todayEnd } = getISTDateBounds();

  const whereClause: any = {
    status: "CONFIRMED",
    startTime: { gte: todayStart },
    endTime: { lte: todayEnd }
  };
  if (turfId) {
    whereClause.turfId = turfId;
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    select: { startTime: true, endTime: true, turfId: true }
  });

  return JSON.parse(JSON.stringify(bookings));
}

import { PaymentService } from "@/services/PaymentService";

export async function createKioskBooking({
  memberId,
  turfId,
  sportId,
  startTime,
  endTime,
  price,
  paymentMethod,
}: {
  memberId: string;
  turfId: string;
  sportId: string;
  startTime: Date;
  endTime: Date;
  price: number;
  paymentMethod: string;
}) {
  // Validate that the entities still exist in the database (prevents foreign key crashes if DB was reset or entities deleted while UI was open)
  const [memberExists, turfExists, sportExists] = await Promise.all([
    prisma.member.findUnique({ where: { id: memberId } }),
    prisma.turf.findUnique({ where: { id: turfId } }),
    prisma.sport.findUnique({ where: { id: sportId } })
  ]);

  if (!memberExists) throw new Error("Member not found in database. Please refresh.");
  if (!turfExists) throw new Error("Turf not found in database. Please refresh.");
  if (!sportExists) throw new Error("Sport not found in database. Please refresh.");

  const conflicting = await prisma.booking.findFirst({
    where: {
      turfId,
      status: "CONFIRMED",
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } }
      ]
    }
  });

  if (conflicting) {
    throw new Error("Time slot is no longer available.");
  }

  // Handle WALLET entirely in one transaction
  if (paymentMethod === "WALLET") {
    const booking = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({ where: { id: memberId } });
      if (!member || member.walletBalance < price * 100) {
        throw new Error("Insufficient wallet balance.");
      }

      await tx.member.update({
        where: { id: memberId },
        data: { walletBalance: { decrement: price * 100 } }
      });

      await tx.walletTransaction.create({
        data: {
          memberId,
          amount: price * 100,
          type: "DEBIT",
          description: `Kiosk booking for ${new Date(startTime).toLocaleString()}`
        }
      });

      const b = await tx.booking.create({
        data: {
          memberId,
          turfId,
          sportId,
          startTime,
          endTime,
          price,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          amountDue: 0,
          participants: {
            create: {
              memberId,
              status: "CONFIRMED"
            }
          }
        }
      });

      await tx.payment.create({
        data: {
          bookingId: b.id,
          amount: price,
          method: "WALLET"
        }
      });

      await tx.transaction.create({
        data: {
          bookingId: b.id,
          memberId: memberId,
          amount: price,
          currency: "INR",
          gateway: "WALLET",
          status: "SUCCESS"
        }
      });

      await tx.ticket.create({
        data: {
          bookingId: b.id,
          qrCode: `kiosk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          guestName: member.name,
          status: "CHECKED_IN",
          usedAt: new Date()
        }
      });

      return b;
    });
    return { success: true, booking: JSON.parse(JSON.stringify(booking)), paymentMethod: "WALLET" };
  }

  // Handle PHONEPE
  if (paymentMethod === "PHONEPE") {
    const b = await prisma.booking.create({
      data: {
        memberId,
        turfId,
        sportId,
        startTime,
        endTime,
        price,
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        amountDue: price,
        participants: {
          create: {
            memberId,
            status: "CONFIRMED"
          }
        }
      }
    });

    const orderData = await PaymentService.createOrder(b.id, "PHONEPE", "WEB", undefined, "/admin/nfc/kiosk");
    return { success: true, booking: JSON.parse(JSON.stringify(b)), paymentMethod: "PHONEPE", orderData };
  }

  // Handle RAZORPAY
  if (paymentMethod === "RAZORPAY") {
    const b = await prisma.booking.create({
      data: {
        memberId,
        turfId,
        sportId,
        startTime,
        endTime,
        price,
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        amountDue: price,
        participants: {
          create: {
            memberId,
            status: "CONFIRMED"
          }
        }
      }
    });

    const orderData = await PaymentService.createOrder(b.id, "RAZORPAY", "WEB");
    return { success: true, booking: JSON.parse(JSON.stringify(b)), paymentMethod: "RAZORPAY", orderData };
  }

  throw new Error("Invalid payment method");
}

export async function confirmKioskRazorpayPayment(
  bookingId: string,
  memberId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  // Verifies and transitions the booking to CONFIRMED + PAID
  await PaymentService.verifyRazorpayPayment(
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  const member = await prisma.member.findUnique({ where: { id: memberId } });

  // Auto check-in the user
  await prisma.ticket.create({
    data: {
      bookingId: bookingId,
      qrCode: `kiosk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      guestName: member?.name || "Member",
      status: "CHECKED_IN",
      usedAt: new Date()
    }
  });

  return { success: true };
}

export async function findMembersByMobile(mobile: string) {
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
            }
          }
        }
      }
    }
  });

  return JSON.parse(JSON.stringify(members));
}
