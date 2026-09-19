"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { prisma } from "@/core/database/prisma";
import { NfcPaymentService } from "@/modules/nfc/nfc-payment.services";
import {
  mergeContiguousSlots,
  calculateSlotPrice,
  calculateLoyaltyDiscount,
} from "./bookings.helper";
import {
  queryBookableTurfs,
  queryBookingsByDate,
  queryAllBookingsByDate,
  searchMemberByMobile,
  searchMemberByCardUid,
  resolveOrCreateMember,
  createBookingCore,
  cancelBookingCore,
  rescheduleBookingCore,
  updateBookingPaymentCore,
  previewExtensionCore,
  confirmExtensionCore,
  addPaymentCore,
  upsertDisplaySession,
  fetchDisplaySession,
  fetchUpiSettings,
  generateRazorpayPaymentLinkCore,
  createAdminPhonePeOrderCore,
  createAdminRazorpayOrderCore,
  verifyAdminRazorpayOrderCore,
  AdminActorInfo,
  CancelBookingResult,
} from "./bookings.lib";
import { eventBus } from "@/core/events";
import { bumpSyncTimestamp } from "@/core/database/sync";

async function bumpBookingSyncTimestamp(tag: string = "admin_booking") {
  await bumpSyncTimestamp(tag);
}

function safeRevalidatePath(path: string, type?: "layout" | "page") {
  try {
    revalidatePath(path, type);
  } catch {
    // Gracefully ignore when invoked outside Next.js request context (e.g. tests)
  }
}

async function getAdminActorInfo(): Promise<AdminActorInfo | undefined> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const admin = await prisma.admin.findFirst({
        where: { email: session.user.email },
      });
      if (admin) {
        return {
          adminId: admin.id,
          adminName: admin.name || admin.email,
        };
      }
    }
  } catch {
    // Non-session context
  }
  return undefined;
}

export async function fetchBookableTurfs() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return await queryBookableTurfs();
}

export async function fetchBookingsByDate(date: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return await queryBookingsByDate(date);
}

export async function searchMember(mobile: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return await searchMemberByMobile(mobile);
}

export async function searchMemberByNfc(cardUid: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return await searchMemberByCardUid(cardUid);
}

export async function createBooking(data: {
  turfIds: string[];
  sportId: string;
  slots: { startTime: Date; endTime: Date }[];
  memberId?: string;
  mobile?: string;
  name?: string;
  participantCount?: number;
  guestNames?: string[];
  additionalMemberIds?: string[];
  redeemPoints?: boolean;
}) {
  const member = await resolveOrCreateMember(data);

  const turfs = await prisma.turf.findMany({
    where: { id: { in: data.turfIds } },
  });
  if (turfs.length === 0 || turfs.some((t) => t.bookingPrice == null)) {
    throw new Error("Invalid turf selection");
  }

  const mergedSlots = mergeContiguousSlots(data.slots);
  const participantCount = data.participantCount || 1;

  const additionalIds = data.additionalMemberIds || [];
  const allMemberIds = [
    member.id,
    ...additionalIds.filter((id) => id !== member.id),
  ];

  const nonFamilyGuestCount = Math.max(
    0,
    participantCount - allMemberIds.length,
  );
  const nonFamilyGuestNames =
    data.guestNames?.slice(additionalIds.length) || [];

  let totalPrice = 0;
  const bookingItems: {
    turf: any;
    slot: { startTime: Date; endTime: Date };
    pricePerPerson: number;
  }[] = [];

  for (const turf of turfs) {
    for (const slot of mergedSlots) {
      const durationMins =
        (new Date(slot.endTime).getTime() -
          new Date(slot.startTime).getTime()) /
        60000;
      const { pricePerPerson, totalPrice: slotTotal } = calculateSlotPrice(
        turf.bookingPrice,
        turf.bookingDurationMinutes,
        durationMins,
        participantCount,
      );
      totalPrice += slotTotal;
      bookingItems.push({ turf, slot, pricePerPerson });
    }
  }

  let totalDiscount = 0;
  let pointsToDeduct = 0;

  if (data.redeemPoints && member.loyaltyPoints > 0) {
    let pointsPerRupee = 100;
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "pointsPerRupee" },
      });
      if (setting?.value) {
        pointsPerRupee = Number(setting.value) || 100;
      }
    } catch {
      pointsPerRupee = 100;
    }

    const discountCalc = calculateLoyaltyDiscount(
      member.loyaltyPoints,
      totalPrice,
      pointsPerRupee,
    );
    totalDiscount = discountCalc.totalDiscount;
    pointsToDeduct = discountCalc.pointsToDeduct;
  }

  const adminInfo = await getAdminActorInfo();

  const bookings = await prisma.$transaction(async (tx) => {
    return await createBookingCore(tx, {
      member,
      turfs,
      sportId: data.sportId,
      bookingItems,
      totalPrice,
      totalDiscount,
      pointsToDeduct,
      participantCount,
      allMemberIds,
      nonFamilyGuestCount,
      nonFamilyGuestNames,
      adminInfo,
    });
  });

  await bumpBookingSyncTimestamp("admin_booking");
  safeRevalidatePath("/", "layout");

  // Emit booking.confirmed domain events
  try {
    const sportRecord = await prisma.sport.findUnique({
      where: { id: data.sportId },
    });
    const sportName = sportRecord?.name || "Sports";

    for (const b of bookings) {
      const bMember = await prisma.member.findUnique({
        where: { id: b.memberId },
      });

      const turfName =
        bookingItems.find((i) => i.turf.id === b.turfId)?.turf.name || "";

      eventBus.emit("booking.confirmed", {
        bookingId: b.id,
        memberId: b.memberId,
        customerName: bMember?.name || "",
        turfName,
        sportName,
        startTime: b.startTime,
        endTime: b.endTime,
        price: b.price,
        discountAmount: b.discountAmount,
        paymentStatus: b.paymentStatus,
        mobile: bMember?.mobile || null,
        participantCount: data.participantCount,
      });
    }
  } catch (e) {
    console.error("Error triggering booking confirmation event", e);
  }

  return bookings;
}

export async function getUpiId() {
  return await fetchUpiSettings();
}

export async function fetchAllBookingsByDate(date: string) {
  return await queryAllBookingsByDate(date);
}

export async function cancelBooking(id: string) {
  const adminInfo = await getAdminActorInfo();

  const cancelResult: CancelBookingResult = await prisma.$transaction(async (tx) => {
    return await cancelBookingCore(tx, id, adminInfo);
  });

  const { booking, refundAmountPaise, originalPayerId } = cancelResult;

  eventBus.emit("booking.cancelled", {
    bookingId: booking.id,
    memberId: originalPayerId,
    customerName: booking.member?.name || "",
    turfName: booking.turf?.name || "Sportsvilla",
    startTime: booking.startTime,
    refundAmountRupees: refundAmountPaise / 100,
    mobile: booking.member?.mobile || null,
  });

  if (refundAmountPaise > 0) {
    eventBus.emit("wallet.credited", {
      memberId: originalPayerId,
      memberName: booking.member?.name,
      rechargeAmount: refundAmountPaise / 100,
      mobile: booking.member?.mobile,
      description: `Refund for cancelled booking ${booking.id}`,
      reason: "REFUND",
      bookingId: booking.id,
    });
  }

  await bumpBookingSyncTimestamp("admin_booking");
  safeRevalidatePath("/", "layout");
}

export async function rescheduleBooking(
  id: string,
  newTurfId: string,
  newStartTime: Date,
  newEndTime: Date,
) {
  const adminInfo = await getAdminActorInfo();

  await prisma.$transaction(async (tx) => {
    await rescheduleBookingCore(
      tx,
      id,
      newTurfId,
      newStartTime,
      newEndTime,
      adminInfo,
    );
  });

  await bumpBookingSyncTimestamp("admin_booking");
  safeRevalidatePath("/", "layout");
}

export async function updateBookingPayment(
  id: string,
  paymentStatus: "PAID" | "UNPAID",
) {
  const adminInfo = await getAdminActorInfo();

  await prisma.$transaction(async (tx) => {
    await updateBookingPaymentCore(tx, id, paymentStatus, adminInfo);
  });

  await bumpBookingSyncTimestamp("admin_booking");
  safeRevalidatePath("/", "layout");
}

export async function previewExtension(
  bookingId: string,
  durationMinutes: number,
) {
  return await previewExtensionCore(bookingId, durationMinutes);
}

export async function confirmExtension(bookingId: string, allocations: any[]) {
  await prisma.$transaction(async (tx) => {
    await confirmExtensionCore(tx, bookingId, allocations);
  });

  await bumpBookingSyncTimestamp("admin_booking");
  safeRevalidatePath("/", "layout");
  return { success: true };
}

export async function addPayment(
  bookingId: string,
  amount: number,
  method: "CASH" | "ONLINE" | "SPORTSVILLA_CARD",
  cardUid?: string,
) {
  if (method === "SPORTSVILLA_CARD") {
    if (!cardUid) {
      throw new Error("Card UID is required for SportsVilla Card payment.");
    }
    const result = await NfcPaymentService.processPayment({
      cardUid,
      bookingId,
      amount,
      description: `POS Payment for booking ${bookingId}`,
      deviceType: "POS_READER",
      location: "ADMIN_POS",
    });

    if (!result.success) {
      throw new Error(
        result.message || result.error || "SportsVilla Card payment failed.",
      );
    }

    safeRevalidatePath("/", "layout");
    return result;
  }

  await prisma.$transaction(async (tx) => {
    await addPaymentCore(tx, bookingId, amount, method);
  });

  await bumpBookingSyncTimestamp("admin_booking");
  safeRevalidatePath("/", "layout");
}

export async function updateDisplaySession(data: {
  bookingId?: string;
  qrData?: string;
  amount?: number;
  memberName?: string;
  status: "IDLE" | "AWAITING_PAYMENT" | "PAID";
}) {
  await upsertDisplaySession(data);
}

export async function getDisplaySession() {
  return await fetchDisplaySession();
}

export async function generateRazorpayPaymentLink(bookingIds: string[]) {
  return await generateRazorpayPaymentLinkCore(bookingIds);
}

export async function createAdminPhonePeOrder(
  bookingIds: string[],
  origin: string,
) {
  return await createAdminPhonePeOrderCore(bookingIds, origin);
}

export async function createAdminRazorpayOrder(bookingIds: string[]) {
  return await createAdminRazorpayOrderCore(bookingIds);
}

export async function verifyAdminRazorpayOrder(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  return await verifyAdminRazorpayOrderCore(orderId, paymentId, signature);
}
