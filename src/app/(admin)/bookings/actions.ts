"use server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSettings } from "../settings/actions";
import { formatIST, getISTDateBounds } from "@/lib/dateUtils";
import { bumpSyncTimestamp } from '@/lib/sync';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppBookingConfirmedTemplate } from "@/lib/whatsapp";
import { NfcPaymentService } from "@/services/NfcPaymentService";
export async function fetchBookableTurfs() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  return await prisma.turf.findMany({
    where: { 
      bookingPrice: { not: null },
      bookingDurationMinutes: { not: null }
    },
    include: { sports: { include: { sport: true } } }
  });
}

export async function fetchBookingsByDate(date: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  const { start: startOfDay, end: endOfDay } = getISTDateBounds(date);

  return await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: { not: "CANCELLED" }
    },
    include: {
      member: true,
      sport: true,
      turf: true,
      payments: true
    }
  });
}

export async function searchMember(mobile: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  if (mobile.length !== 10) return [];
  return await prisma.member.findMany({ where: { mobile } });
}

export async function searchMemberByNfc(cardUid: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");
  const card = await prisma.nfcCard.findFirst({
    where: { cardUid, status: "ACTIVE" },
    include: { member: true }
  });
  if (card && card.member) {
    return card.member;
  }
  return null;
}

export async function createBooking(data: {
  turfIds: string[];
  sportId: string;
  slots: { startTime: Date, endTime: Date }[];
  memberId?: string;
  mobile?: string;
  name?: string;
  participantCount?: number;
  guestNames?: string[];
  additionalMemberIds?: string[];
  redeemPoints?: boolean;
}) {
  let member;
  if (data.memberId) {
    member = await prisma.member.findUnique({ where: { id: data.memberId } });
  } else if (data.mobile && data.name) {
    member = await prisma.member.findFirst({ where: { mobile: data.mobile } });
    if (!member) {
      const count = await prisma.member.count({ where: { mobile: data.mobile } });
      const id = `${data.mobile}_${count + 1}`;
      member = await prisma.member.create({
        data: { id, mobile: data.mobile, name: data.name }
      });
    }
  }

  if (!member) throw new Error("Member information is required");

  const turfs = await prisma.turf.findMany({ where: { id: { in: data.turfIds } } });
  if (turfs.length === 0 || turfs.some(t => t.bookingPrice == null)) throw new Error("Invalid turf selection");

  // Merge contiguous slots
  const sortedSlots = [...data.slots].sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  const mergedSlots: { startTime: any, endTime: any }[] = [];
  for (const slot of sortedSlots) {
    if (mergedSlots.length === 0) {
      mergedSlots.push({ ...slot });
    } else {
      const last = mergedSlots[mergedSlots.length - 1];
      if (new Date(last.endTime).getTime() === new Date(slot.startTime).getTime()) {
        last.endTime = slot.endTime;
      } else {
        mergedSlots.push({ ...slot });
      }
    }
  }

  const participantCount = data.participantCount || 1;
  
  // Build list of all member IDs who should get their own booking
  // Primary member + any additional family members selected
  const additionalIds = data.additionalMemberIds || [];
  const allMemberIds = [member.id, ...additionalIds.filter(id => id !== member.id)];
  
  // Remaining guests (non-family) get tickets under the primary member's booking
  const nonFamilyGuestCount = Math.max(0, participantCount - allMemberIds.length);
  const nonFamilyGuestNames = data.guestNames?.slice(additionalIds.length) || [];

  // Calculate total price for all participants across all turfs/slots
  let totalPrice = 0;
  const bookingItems: { turf: any, slot: any, pricePerPerson: number }[] = [];
  for (const turf of turfs) {
    const pricePerSlot = (turf.bookingPrice || 0) / (turf.bookingDurationMinutes || 60) * 30;
    for (const slot of mergedSlots) {
      const durationMins = (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000;
      const pricePerPerson = pricePerSlot * (durationMins / 30);
      totalPrice += pricePerPerson * participantCount;
      bookingItems.push({ turf, slot, pricePerPerson });
    }
  }

  let totalDiscount = 0;
  let pointsToDeduct = 0;
  
  if (data.redeemPoints && member.loyaltyPoints > 0) {
    const settings = await getSettings();
    const pointsPerRupee = Number(settings.pointsPerRupee || 100);
    const maxPossibleDiscount = Math.floor(member.loyaltyPoints / pointsPerRupee);
    totalDiscount = Math.min(totalPrice, maxPossibleDiscount);
    pointsToDeduct = totalDiscount * pointsPerRupee;
  }

  const bookings = await prisma.$transaction(async (tx) => {
    const createdBookings: any[] = [];
    
    for (const item of bookingItems) {
      // 1. Verify Slot Availability to prevent double-booking Walk-ins
      const overlappingBookings = await tx.booking.findMany({
        where: {
          turfId: item.turf.id,
          status: { not: "CANCELLED" },
          startTime: { lt: new Date(item.slot.endTime) },
          endTime: { gt: new Date(item.slot.startTime) }
        }
      });
      
      const usedCapacity = overlappingBookings.reduce((sum, b) => sum + b.participantCount, 0);
      const turfCapacity = item.turf.capacityPerSlot || 1;
      
      if (participantCount > (turfCapacity - usedCapacity)) {
        throw new Error(`Slot unavailable for Turf ${item.turf.name} at ${new Date(item.slot.startTime).toLocaleTimeString()}. Capacity exceeded.`);
      }

      // Create a booking for each family member
      for (const currentMemberId of allMemberIds) {
        const isPrimary = currentMemberId === member.id;
        
        // Each member gets 1 ticket for themselves
        const ticketsForThisMember: { qrCode: string, guestName: string | null }[] = [{
          qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-SYKM`,
          guestName: null
        }];

        // Only the primary member's booking carries the non-family guest tickets
        if (isPrimary && nonFamilyGuestCount > 0) {
          for (let g = 0; g < nonFamilyGuestCount; g++) {
            ticketsForThisMember.push({
              qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-SYKM`,
              guestName: nonFamilyGuestNames[g] || null
            });
          }
        }

        const bookingParticipants = isPrimary ? (1 + nonFamilyGuestCount) : 1;
        const bookingPrice = item.pricePerPerson * bookingParticipants;

        // Only primary member gets the discount
        const ratio = totalPrice > 0 ? (bookingPrice / totalPrice) : 0;
        const itemDiscount = isPrimary ? (totalDiscount * ratio) : 0;
        const itemPointsRedeemed = isPrimary ? Math.round(pointsToDeduct * ratio) : 0;

        const booking = await tx.booking.create({
          data: {
            turfId: item.turf.id,
            memberId: currentMemberId,
            sportId: data.sportId,
            startTime: new Date(item.slot.startTime),
            endTime: new Date(item.slot.endTime),
            price: bookingPrice,
            discountAmount: itemDiscount,
            pointsRedeemed: itemPointsRedeemed,
            participantCount: bookingParticipants,
            paymentStatus: "UNPAID",
            status: "CONFIRMED",
            amountDue: bookingPrice - itemDiscount,
            tickets: { create: ticketsForThisMember }
          }
        });
        createdBookings.push(booking);
      }
    }

    if (pointsToDeduct > 0) {
      await tx.member.update({
        where: { id: member.id },
        data: { loyaltyPoints: { decrement: pointsToDeduct } }
      });
      await tx.loyaltyHistory.create({
        data: {
          memberId: member.id,
          points: pointsToDeduct,
          type: "REDEEMED",
          source: "BOOKING",
          description: `Redeemed points for ₹${totalDiscount} discount`
        }
      });
    }

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const admin = await tx.admin.findFirst({ where: { email: session.user.email } });
      if (admin) {
        for (const b of createdBookings) {
          await tx.auditLog.create({
            data: {
              action: "CREATE_BOOKING",
              entity: "Booking",
              entityId: b.id,
              details: JSON.stringify({ price: b.price, turfId: b.turfId }),
              adminId: admin.id,
              adminName: admin.name || admin.email,
            }
          });
        }
      }
    }

    return createdBookings;
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");

  // Dispatch WhatsApp Event for Manual Bookings
  try {
    const sportRecord = await prisma.sport.findUnique({ where: { id: data.sportId } });
    const sportName = sportRecord?.name || "Sports";
    for (const b of bookings) {
      const bMember = await prisma.member.findUnique({ where: { id: b.memberId } });
      if (!bMember || !bMember.mobile) continue;

      const turfName = bookingItems.find(i => i.turf.id === b.turfId)?.turf.name || "";
      const formattedDate = new Date(b.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', month: 'short', day: 'numeric' });
      const formattedTime = new Date(b.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
      const endFormatted = new Date(b.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
      const timeString = `${formattedDate}, ${formattedTime} - ${endFormatted}`;
      const priceStr = `₹${Math.round(b.price - b.discountAmount)}`;
      const paymentStr = b.paymentStatus === "UNPAID" ? `${priceStr} (DUE)` : `${priceStr} (${b.paymentStatus})`;
      
      sendWhatsAppBookingConfirmedTemplate(
        bMember.name,
        turfName,
        sportName,
        timeString,
        paymentStr,
        bMember.mobile
      ).catch(console.error);
    }
  } catch(e) {
    console.error("Error triggering WhatsApp booking confirmation", e);
  }

  return bookings;
}

export async function getUpiId() {
  const settings = await getSettings();
  return { upiId: settings.upiId || "", businessName: settings.businessName || "SportsVilla" };
}

export async function fetchAllBookingsByDate(date: string) {
  const { start: startOfDay, end: endOfDay } = getISTDateBounds(date);

  return await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      member: true,
      sport: true,
      turf: true,
      payments: true,
      tickets: true
    },
    orderBy: {
      startTime: 'asc'
    }
  });
}

export async function cancelBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { member: true, turf: true }
  });
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "CANCELLED") {
    const session = await getServerSession(authOptions);
    let adminId = undefined;
    let adminName = "System";
    if (session?.user?.email) {
      const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
      if (admin) {
        adminId = admin.id;
        adminName = admin.name || admin.email;
      }
    }

    // Find original payer from wallet transaction
    const walletDebit = await prisma.walletTransaction.findFirst({
      where: { description: `Payment for booking ${booking.id}`, type: 'DEBIT' }
    });
    const originalPayerId = walletDebit?.memberId || booking.memberId;
    const refundAmountPaise = booking.advancePaid ? booking.advancePaid * 100 : 0;

    // Find loyalty points to reverse
    const loyaltyToReverse = await prisma.loyaltyHistory.findFirst({
      where: { source: 'BOOKING', description: { contains: booking.id }, type: 'EARNED' }
    });
    const pointsToReverse = loyaltyToReverse?.points || 0;
    const pointsEarnerId = loyaltyToReverse?.memberId;

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id }, data: { status: "CANCELLED" } });

      await tx.ticket.updateMany({ where: { bookingId: id }, data: { status: 'CANCELLED' } });
      await tx.bookingParticipant.updateMany({ where: { bookingId: id }, data: { status: 'CANCELLED' } });

      // Refund wallet if advance was paid
      if (refundAmountPaise > 0) {
        await tx.member.update({
          where: { id: originalPayerId },
          data: { walletBalance: { increment: refundAmountPaise } }
        });
        await tx.walletTransaction.create({
          data: {
            memberId: originalPayerId,
            amount: refundAmountPaise,
            type: 'CREDIT',
            description: `Refund for cancelled booking ${booking.id}`
          }
        });
      }

      // Restore redeemed loyalty points
      if (booking.pointsRedeemed > 0) {
        await tx.member.update({
          where: { id: booking.memberId },
          data: { loyaltyPoints: { increment: booking.pointsRedeemed } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: booking.memberId,
            points: booking.pointsRedeemed,
            type: "REFUND",
            source: "MANUAL",
            description: "Refund for cancelled booking"
          }
        });
      }

      // Reverse earned loyalty points
      if (pointsToReverse > 0 && pointsEarnerId) {
        await tx.member.update({
          where: { id: pointsEarnerId },
          data: { loyaltyPoints: { decrement: pointsToReverse } }
        });
        await tx.loyaltyHistory.create({
          data: {
            memberId: pointsEarnerId,
            points: pointsToReverse,
            type: 'REVERSED',
            source: 'MANUAL',
            description: `Reversed for cancelled booking ${booking.id}`
          }
        });
      }

      // Free coupon usage slots
      await tx.couponUsage.deleteMany({ where: { bookingId: booking.id } });

      // Decrement user sport stat
      await tx.userSportStat.updateMany({
        where: { memberId: booking.memberId, sportId: booking.sportId, bookingCount: { gt: 0 } },
        data: { bookingCount: { decrement: 1 } }
      });

      await tx.auditLog.create({
        data: {
          action: "CANCEL_BOOKING",
          entity: "Booking",
          entityId: id,
          details: JSON.stringify({ previousStatus: booking.status, refundAmountPaise }),
          adminId,
          adminName
        }
      });
    });

    // Send WhatsApp notification (non-critical)
    if (booking.member?.mobile) {
      try {
        const { sendWhatsAppBookingCancelledTemplate } = require("@/lib/whatsapp");
        const formattedTime = new Date(booking.startTime).toLocaleTimeString('en-IN', {
          hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
          day: 'numeric', month: 'short'
        });
        sendWhatsAppBookingCancelledTemplate(
          booking.member.name,
          booking.turf?.name || "Sportsvilla",
          formattedTime,
          refundAmountPaise / 100,
          booking.member.mobile
        ).catch(console.error);
      } catch (waErr) {
        console.error("Failed to send admin cancel WhatsApp template:", waErr);
      }
    }
  }
  
  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
}

export async function rescheduleBooking(id: string, newTurfId: string, newStartTime: Date, newEndTime: Date) {
  const session = await getServerSession(authOptions);
  let adminId: string | undefined = undefined;
  let adminName = "System";
  if (session?.user?.email) {
    const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
    if (admin) {
      adminId = admin.id;
      adminName = admin.name || admin.email;
    }
  }

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id },
      include: { payments: true }
    });
    if (!booking) throw new Error("Booking not found");
    if (booking.status === "CANCELLED") throw new Error("Cannot reschedule a cancelled booking");

    const newTurf = await tx.turf.findUnique({ where: { id: newTurfId } });
    if (!newTurf) throw new Error("Turf not found");

    // Check capacity at the new slot (not just a single conflict)
    const overlappingBookings = await tx.booking.findMany({
      where: {
        id: { not: id },
        turfId: newTurfId,
        status: { not: "CANCELLED" },
        startTime: { lt: newEndTime },
        endTime: { gt: newStartTime }
      }
    });

    const usedCapacity = overlappingBookings.reduce((sum, b) => sum + b.participantCount, 0);
    if (booking.participantCount > (newTurf.capacityPerSlot - usedCapacity)) {
      throw new Error("The selected slot does not have enough capacity.");
    }

    // Recalculate price if turf or duration changed
    const durationMinutes = (new Date(newEndTime).getTime() - new Date(newStartTime).getTime()) / 60000;
    const baseSlotMinutes = newTurf.bookingDurationMinutes || 60;
    const pricePerMinute = (newTurf.bookingPrice != null ? newTurf.bookingPrice : (booking.price / (durationMinutes || 60))) / baseSlotMinutes;
    const calculatedPrice = newTurf.bookingPrice != null 
      ? Math.round(pricePerMinute * durationMinutes * (booking.participantCount || 1))
      : booking.price;

    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
    const netPrice = Math.max(0, calculatedPrice - (booking.discountAmount || 0));
    const newStatus = totalPaid >= netPrice ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";
    const newAmountDue = Math.max(0, netPrice - totalPaid);

    await tx.booking.update({
      where: { id },
      data: {
        turfId: newTurfId,
        startTime: new Date(newStartTime),
        endTime: new Date(newEndTime),
        price: calculatedPrice,
        amountDue: newAmountDue,
        paymentStatus: newStatus
      }
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
          newPrice: calculatedPrice
        }),
        adminId,
        adminName
      }
    });
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
}

export async function updateBookingPayment(id: string, paymentStatus: "PAID" | "UNPAID") {
  const session = await getServerSession(authOptions);
  let adminId = undefined;
  let adminName = "System";
  if (session?.user?.email) {
    const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
    if (admin) {
      adminId = admin.id;
      adminName = admin.name || admin.email;
    }
  }

  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id }, include: { payments: true } });
    if (!booking) throw new Error("Booking not found");

    let newAmountDue = booking.amountDue;
    if (paymentStatus === "PAID") {
      newAmountDue = 0;
    } else if (paymentStatus === "UNPAID") {
      const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
      const netPrice = Math.max(0, booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0));
      newAmountDue = Math.max(0, netPrice - totalPaid);
    }

    await tx.booking.update({
      where: { id },
      data: { paymentStatus, amountDue: newAmountDue }
    });

    await tx.auditLog.create({
      data: {
        action: "UPDATE_PAYMENT",
        entity: "Booking",
        entityId: id,
        details: JSON.stringify({ paymentStatus }),
        adminId,
        adminName
      }
    });
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
}

export async function previewExtension(bookingId: string, durationMinutes: number) {
  if (durationMinutes <= 0 || durationMinutes % 30 !== 0) {
    throw new Error("Duration must be a multiple of 30 minutes.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { turf: true }
  });
  
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED") throw new Error("Cannot extend cancelled booking");

  const applicableTurfs = await prisma.turf.findMany({
    where: {
      sports: { some: { sportId: booking.sportId } },
      bookingPrice: { not: null }
    }
  });

  const numChunks = durationMinutes / 30;
  let currentStartTime = booking.endTime;
  const allocations: { turfId: string, turfName: string, startTime: string, endTime: string, price: number, isSameCourt: boolean }[] = [];
  
  for (let i = 0; i < numChunks; i++) {
    const chunkEndTime = new Date(currentStartTime.getTime() + 30 * 60000);
    
    // 1. Try current court first
    let assignedTurf = null;
    let isSameCourt = false;

    const conflictOnCurrent = await prisma.booking.findFirst({
      where: {
        turfId: booking.turfId,
        status: { not: "CANCELLED" },
        startTime: { lt: chunkEndTime },
        endTime: { gt: currentStartTime }
      }
    });

    if (!conflictOnCurrent) {
      assignedTurf = applicableTurfs.find(t => t.id === booking.turfId);
      isSameCourt = true;
    } else {
      // 2. Try other courts
      for (const altTurf of applicableTurfs) {
        if (altTurf.id === booking.turfId) continue;
        const altConflict = await prisma.booking.findFirst({
          where: {
            turfId: altTurf.id,
            status: { not: "CANCELLED" },
            startTime: { lt: chunkEndTime },
            endTime: { gt: currentStartTime }
          }
        });
        if (!altConflict) {
          assignedTurf = altTurf;
          break;
        }
      }
    }

    if (!assignedTurf) {
      return { available: false, message: `Could not find courts for the full ${durationMinutes} mins. Failed at ${formatIST(currentStartTime, 'h:mm a')}.` };
    }

    const priceFor30m = (assignedTurf.bookingPrice || 0) / (assignedTurf.bookingDurationMinutes || 60) * 30;
    
    allocations.push({
      turfId: assignedTurf.id,
      turfName: assignedTurf.name,
      startTime: currentStartTime.toISOString(),
      endTime: chunkEndTime.toISOString(),
      price: priceFor30m,
      isSameCourt
    });

    currentStartTime = chunkEndTime;
  }

  // Merge consecutive chunks on the same court
  const mergedAllocations = [];
  for (const alloc of allocations) {
    if (mergedAllocations.length === 0) {
      mergedAllocations.push({ ...alloc });
    } else {
      const last = mergedAllocations[mergedAllocations.length - 1];
      if (last.turfId === alloc.turfId && last.endTime === alloc.startTime) {
        last.endTime = alloc.endTime;
        last.price += alloc.price;
      } else {
        mergedAllocations.push({ ...alloc });
      }
    }
  }

  return {
    available: true,
    allocations: mergedAllocations,
    totalPrice: mergedAllocations.reduce((sum, a) => sum + a.price, 0)
  };
}

export async function confirmExtension(bookingId: string, allocations: any[]) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });
  if (!booking) throw new Error("Booking not found");

  await prisma.$transaction(async (tx) => {
    for (const alloc of allocations) {
      // Re-check availability inside transaction
      const conflict = await tx.booking.findFirst({
        where: {
          turfId: alloc.turfId,
          status: { not: "CANCELLED" },
          startTime: { lt: new Date(alloc.endTime) },
          endTime: { gt: new Date(alloc.startTime) },
          id: { not: bookingId }
        }
      });
      if (conflict) throw new Error(`Slot no longer available for ${alloc.turfName}`);

      if (alloc.isSameCourt && alloc.startTime === booking.endTime.toISOString()) {
        const totalPaid = (await tx.payment.findMany({ where: { bookingId } })).reduce((s, p) => s + p.amount, 0);
        const newPrice = booking.price + alloc.price;
        const netPayable = newPrice - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0);
        const newStatus: "PAID" | "PARTIAL" | "UNPAID" = totalPaid >= netPayable ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID';
        const amountDue = Math.max(0, netPayable - totalPaid);

        await tx.booking.update({
          where: { id: bookingId },
          data: { 
            endTime: new Date(alloc.endTime),
            price: newPrice,
            paymentStatus: newStatus,
            amountDue
          }
        });

        // Keep local in-memory booking updated for subsequent iterations
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
              create: Array.from({ length: booking.participantCount }).map(() => ({
                qrCode: `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-SYKM`
              }))
            }
          }
        });
      }
    }
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
  return { success: true };
}

export async function addPayment(
  bookingId: string,
  amount: number,
  method: "CASH" | "ONLINE" | "SPORTSVILLA_CARD",
  cardUid?: string
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED") throw new Error("Cannot record payment for a cancelled booking");

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
      throw new Error(result.message || result.error || "SportsVilla Card payment failed.");
    }

    revalidatePath("/", "layout");
    return result;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: { bookingId, amount, method }
    });

    await tx.transaction.create({
      data: {
        bookingId,
        memberId: booking.memberId,
        gateway: method === "CASH" ? "MANUAL" : method === "ONLINE" ? "ONLINE" : "WALLET",
        amount,
        status: "SUCCESS",
        metadata: JSON.stringify({ method })
      }
    });

    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
    const netPrice = booking.price - (booking.discountAmount || 0) - (booking.pointsRedeemed || 0);
    
    let newStatus = "UNPAID";
    if (totalPaid >= netPrice) {
      newStatus = "PAID";
    } else if (totalPaid > 0) {
      newStatus = "PARTIAL";
    }

    await tx.booking.update({
      where: { id: bookingId },
      data: { 
        paymentStatus: newStatus,
        advancePaid: { increment: amount },
        amountDue: Math.max(0, netPrice - totalPaid)
      }
    });
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
}

export async function updateDisplaySession(data: { bookingId?: string; qrData?: string; amount?: number; memberName?: string; status: "IDLE" | "AWAITING_PAYMENT" | "PAID" }) {
  await prisma.displaySession.upsert({
    where: { id: "MAIN_DISPLAY" },
    update: data,
    create: { id: "MAIN_DISPLAY", ...data }
  });
  // Note: revalidatePath might not be needed for polling, but good practice
}

export async function getDisplaySession() {
  return await prisma.displaySession.findUnique({
    where: { id: "MAIN_DISPLAY" }
  });
}

export async function generateRazorpayPaymentLink(bookingIds: string[]) {
  const bookings = await prisma.booking.findMany({
    where: { id: { in: bookingIds } },
    include: { member: true }
  });
  
  if (bookings.length === 0) throw new Error("No bookings found");
  
  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  if (totalDue <= 0) throw new Error("No amount due");
  
  const primaryMember = bookings[0].member;
  
  const { PaymentService } = await import('@/services/PaymentService');
  const shortUrl = await PaymentService.createPaymentLink(
    totalDue,
    `Booking for ${bookings.length} slot(s)`,
    { name: primaryMember.name, contact: primaryMember.mobile ? `+91${primaryMember.mobile}` : "" },
    bookings.length === 1 ? bookings[0].id : "BATCH_" + require('crypto').createHash('md5').update(bookings.map(b=>b.id).join(',')).digest('hex').substring(0,34)
  );
  
  return shortUrl;
}

export async function createAdminPhonePeOrder(bookingIds: string[], origin: string) {
  const bookings = await prisma.booking.findMany({ where: { id: { in: bookingIds } }, include: { member: true } });
  if (bookings.length === 0) throw new Error("No bookings found");
  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  if (totalDue <= 0) throw new Error("No amount due");

  const merchantId = await prisma.setting.findUnique({ where: { key: 'PHONEPE_MERCHANT_ID' } });
  const saltKey = await prisma.setting.findUnique({ where: { key: 'PHONEPE_SALT_KEY' } });
  const saltIndex = await prisma.setting.findUnique({ where: { key: 'PHONEPE_SALT_INDEX' } });
  const envSetting = await prisma.setting.findUnique({ where: { key: 'PHONEPE_ENV' } });
  
  if (!merchantId?.value || !saltKey?.value || !saltIndex?.value) {
    throw new Error('PhonePe is not configured');
  }

  const crypto = require('crypto');
  const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  const payload = {
    merchantId: merchantId.value,
    merchantTransactionId: transactionId,
    merchantUserId: bookings[0].memberId,
    amount: Math.round(totalDue * 100),
    redirectUrl: `${baseUrl}/play/booking-success?multi=1`,
    redirectMode: "POST",
    callbackUrl: `${baseUrl}/api/client/v1/payments/webhook?gateway=PHONEPE`,
    mobileNumber: bookings[0].member.mobile,
    paymentInstrument: { type: "PAY_PAGE" }
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const stringToHash = payloadBase64 + "/pg/v1/pay" + saltKey.value;
  const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
  const xVerify = `${sha256}###${saltIndex.value}`;

  const phonePeHost = envSetting?.value === 'PROD' 
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/hermes';

  const response = await fetch(`${phonePeHost}/pg/v1/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-VERIFY': xVerify },
    body: JSON.stringify({ request: payloadBase64 })
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'PhonePe init failed');
  }

  await prisma.transaction.create({
    data: {
      gatewayOrderId: transactionId,
      bookingId: bookings[0].id,
      memberId: bookings[0].memberId,
      amount: totalDue,
      currency: "INR",
      gateway: "PHONEPE",
      status: "PENDING",
      metadata: JSON.stringify({ bookingIds, platform: "WEB", initiatedAt: new Date().toISOString() })
    }
  });

  return { redirectUrl: data.data.instrumentResponse.redirectInfo.url, transactionId };
}

export async function createAdminRazorpayOrder(bookingIds: string[]) {
  const bookings = await prisma.booking.findMany({ where: { id: { in: bookingIds } }, include: { member: true } });
  if (bookings.length === 0) throw new Error("No bookings found");
  const totalDue = bookings.reduce((sum, b) => sum + (b.amountDue || 0), 0);
  if (totalDue <= 0) throw new Error("No amount due");

  const rzpKey = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_ID' } });
  const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
  if (!rzpKey?.value || !rzpSecret?.value) throw new Error('Razorpay not configured');

  const Razorpay = (await import('razorpay')).default;
  const razorpay = new Razorpay({ key_id: rzpKey.value, key_secret: rzpSecret.value });
  
  const order = await razorpay.orders.create({
    amount: Math.round(totalDue * 100),
    currency: "INR",
    receipt: "admin_rzp_" + Date.now()
  });

  await prisma.transaction.create({
    data: {
      gatewayOrderId: order.id,
      amount: totalDue,
      currency: "INR",
      gateway: "RAZORPAY",
      status: "PENDING",
      metadata: JSON.stringify({ bookingIds })
    }
  });

  return { keyId: rzpKey.value, orderId: order.id, amount: totalDue };
}

export async function verifyAdminRazorpayOrder(orderId: string, paymentId: string, signature: string) {
  const rzpSecret = await prisma.setting.findUnique({ where: { key: 'RAZORPAY_KEY_SECRET' } });
  const crypto = await import('crypto');
  const expected = crypto.createHmac('sha256', rzpSecret!.value).update(orderId + "|" + paymentId).digest('hex');
  if (expected !== signature) throw new Error("Invalid signature");

  const tx = await prisma.transaction.findFirst({ where: { gatewayOrderId: orderId } });
  if (!tx || !tx.metadata) throw new Error("Transaction not found");

  const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;
  const bookingIds: string[] = (meta as any).bookingIds || [];

  const { PaymentService } = await import('@/services/PaymentService');
  
  await prisma.transaction.update({
    where: { id: tx.id },
    data: { status: "SUCCESS", gatewayPaymentId: paymentId }
  });

  
  let remainingAmount = tx.amount;
  for (const bid of bookingIds) {
    const booking = await prisma.booking.findUnique({ where: { id: bid } });
    if (booking && booking.paymentStatus !== 'PAID') {
      const due = booking.amountDue || booking.price;
      const amountToApply = Math.min(due, remainingAmount);
      
      const settleResult = await PaymentService.settleSuccessfulPayment({
        bookingId: bid,
        gateway: 'RAZORPAY',
        gatewayOrderId: orderId,
        gatewayPaymentId: paymentId,
        paidAmountRupees: amountToApply,
        metadata: { adminDirect: true }
      });
      if (settleResult.success && settleResult.status === 'PAID') {
        await PaymentService.sendConfirmationAndTickets(settleResult.booking);
      }
      remainingAmount -= amountToApply;
      if (remainingAmount <= 0) break;
    }
  }

}
