/* eslint-disable @typescript-eslint/no-explicit-any */
import { AdminActorInfo } from "./booking-creation.lib";

export interface CancelBookingResult {
  booking: any;
  refundAmountPaise: number;
  originalPayerId: string;
  pointsToReverse: number;
  pointsEarnerId?: string;
}

export async function cancelBookingCore(
  tx: any,
  id: string,
  adminInfo?: AdminActorInfo,
): Promise<CancelBookingResult> {
  const booking = await tx.booking.findUnique({
    where: { id },
    include: { member: true, turf: true },
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.status === "CANCELLED") {
    return {
      booking,
      refundAmountPaise: 0,
      originalPayerId: booking.memberId,
      pointsToReverse: 0,
      pointsEarnerId: undefined,
    };
  }

  const walletDebit = await tx.walletTransaction.findFirst({
    where: { description: `Payment for booking ${booking.id}`, type: "DEBIT" },
  });
  const originalPayerId = walletDebit?.memberId || booking.memberId;
  const refundAmountPaise = booking.advancePaid ? booking.advancePaid * 100 : 0;

  const loyaltyToReverse = await tx.loyaltyHistory.findFirst({
    where: {
      source: "BOOKING",
      description: { contains: booking.id },
      type: "EARNED",
    },
  });
  const pointsToReverse = loyaltyToReverse?.points || 0;
  const pointsEarnerId = loyaltyToReverse?.memberId;

  await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  await tx.ticket.updateMany({
    where: { bookingId: id },
    data: { status: "CANCELLED" },
  });
  await tx.bookingParticipant.updateMany({
    where: { bookingId: id },
    data: { status: "CANCELLED" },
  });

  if (refundAmountPaise > 0) {
    await tx.member.update({
      where: { id: originalPayerId },
      data: { walletBalance: { increment: refundAmountPaise } },
    });
    await tx.walletTransaction.create({
      data: {
        memberId: originalPayerId,
        amount: refundAmountPaise,
        type: "CREDIT",
        description: `Refund for cancelled booking ${booking.id}`,
      },
    });
  }

  if (booking.pointsRedeemed > 0) {
    await tx.member.update({
      where: { id: booking.memberId },
      data: { loyaltyPoints: { increment: booking.pointsRedeemed } },
    });
    await tx.loyaltyHistory.create({
      data: {
        memberId: booking.memberId,
        points: booking.pointsRedeemed,
        type: "REFUND",
        source: "MANUAL",
        description: "Refund for cancelled booking",
      },
    });
  }

  if (pointsToReverse > 0 && pointsEarnerId) {
    await tx.member.update({
      where: { id: pointsEarnerId },
      data: { loyaltyPoints: { decrement: pointsToReverse } },
    });
    await tx.loyaltyHistory.create({
      data: {
        memberId: pointsEarnerId,
        points: pointsToReverse,
        type: "REVERSED",
        source: "MANUAL",
        description: `Reversed for cancelled booking ${booking.id}`,
      },
    });
  }

  await tx.couponUsage.deleteMany({ where: { bookingId: booking.id } });

  await tx.userSportStat.updateMany({
    where: {
      memberId: booking.memberId,
      sportId: booking.sportId,
      bookingCount: { gt: 0 },
    },
    data: { bookingCount: { decrement: 1 } },
  });

  await tx.auditLog.create({
    data: {
      action: "CANCEL_BOOKING",
      entity: "Booking",
      entityId: id,
      details: JSON.stringify({
        previousStatus: booking.status,
        refundAmountPaise,
      }),
      adminId: adminInfo?.adminId,
      adminName: adminInfo?.adminName || "System",
    },
  });

  return {
    booking,
    refundAmountPaise,
    originalPayerId,
    pointsToReverse,
    pointsEarnerId,
  };
}
