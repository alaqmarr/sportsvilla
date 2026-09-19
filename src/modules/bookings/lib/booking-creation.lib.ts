/* eslint-disable @typescript-eslint/no-explicit-any */
import { checkSlotCapacity } from "./booking-queries.lib";
import { buildTicketsForMember } from "../bookings.worker";

export interface CreateBookingDomainInput {
  turfIds: string[];
  sportId: string;
  slots: { startTime: Date | string; endTime: Date | string }[];
  memberId?: string;
  mobile?: string;
  name?: string;
  participantCount?: number;
  guestNames?: string[];
  additionalMemberIds?: string[];
  redeemPoints?: boolean;
}

export interface AdminActorInfo {
  adminId?: string;
  adminName?: string;
}

export async function createBookingCore(
  tx: any,
  input: {
    member: any;
    turfs?: any[];
    sportId: string;
    bookingItems: {
      turf: any;
      slot: { startTime: Date | string; endTime: Date | string };
      pricePerPerson: number;
    }[];
    totalPrice: number;
    totalDiscount: number;
    pointsToDeduct: number;
    participantCount: number;
    allMemberIds: string[];
    nonFamilyGuestCount: number;
    nonFamilyGuestNames: string[];
    adminInfo?: AdminActorInfo;
  },
) {
  const {
    member,
    sportId,
    bookingItems,
    totalPrice,
    totalDiscount,
    pointsToDeduct,
    participantCount,
    allMemberIds,
    nonFamilyGuestCount,
    nonFamilyGuestNames,
    adminInfo,
  } = input;

  const createdBookings: any[] = [];

  for (const item of bookingItems) {
    const slotStart = new Date(item.slot.startTime);
    const slotEnd = new Date(item.slot.endTime);

    const capacityCheck = await checkSlotCapacity(
      tx,
      item.turf.id,
      slotStart,
      slotEnd,
      participantCount,
    );

    if (!capacityCheck.available) {
      throw new Error(
        `Slot unavailable for Turf ${item.turf.name} at ${slotStart.toLocaleTimeString()}. Capacity exceeded.`,
      );
    }

    for (const currentMemberId of allMemberIds) {
      const isPrimary = currentMemberId === member.id;

      const ticketsForThisMember = buildTicketsForMember({
        isPrimary,
        nonFamilyGuestCount,
        nonFamilyGuestNames,
      });

      const bookingParticipants = isPrimary ? 1 + nonFamilyGuestCount : 1;
      const bookingPrice = item.pricePerPerson * bookingParticipants;

      const ratio = totalPrice > 0 ? bookingPrice / totalPrice : 0;
      const itemDiscount = isPrimary ? totalDiscount * ratio : 0;
      const itemPointsRedeemed = isPrimary
        ? Math.round(pointsToDeduct * ratio)
        : 0;

      const booking = await tx.booking.create({
        data: {
          turfId: item.turf.id,
          memberId: currentMemberId,
          sportId,
          startTime: slotStart,
          endTime: slotEnd,
          price: bookingPrice,
          discountAmount: itemDiscount,
          pointsRedeemed: itemPointsRedeemed,
          participantCount: bookingParticipants,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
          amountDue: bookingPrice - itemDiscount,
          tickets: { create: ticketsForThisMember },
        },
      });

      createdBookings.push(booking);
    }
  }

  if (pointsToDeduct > 0) {
    await tx.member.update({
      where: { id: member.id },
      data: { loyaltyPoints: { decrement: pointsToDeduct } },
    });
    await tx.loyaltyHistory.create({
      data: {
        memberId: member.id,
        points: pointsToDeduct,
        type: "REDEEMED",
        source: "BOOKING",
        description: `Redeemed points for ₹${totalDiscount} discount`,
      },
    });
  }

  if (adminInfo?.adminId) {
    for (const b of createdBookings) {
      await tx.auditLog.create({
        data: {
          action: "CREATE_BOOKING",
          entity: "Booking",
          entityId: b.id,
          details: JSON.stringify({ price: b.price, turfId: b.turfId }),
          adminId: adminInfo.adminId,
          adminName: adminInfo.adminName || "Admin",
        },
      });
    }
  }

  return createdBookings;
}
