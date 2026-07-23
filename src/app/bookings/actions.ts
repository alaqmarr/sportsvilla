"use server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSettings } from "../settings/actions";
import { formatIST, getISTDateBounds } from "../../lib/dateUtils";
import { bumpSyncTimestamp } from '@/lib/sync';
export async function fetchBookableTurfs() {
  return await prisma.turf.findMany({
    where: { 
      bookingPrice: { not: null },
      bookingDurationMinutes: { not: null }
    },
    include: { sports: { include: { sport: true } } }
  });
}

export async function fetchBookingsByDate(date: string) {
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
  if (mobile.length !== 10) return [];
  return await prisma.member.findMany({ where: { mobile } });
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

    return createdBookings;
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
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
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "CANCELLED") {
    const queries: any[] = [
      prisma.booking.update({
        where: { id },
        data: { status: "CANCELLED" }
      })
    ];

    if (booking.pointsRedeemed > 0) {
      queries.push(
        prisma.member.update({
          where: { id: booking.memberId },
          data: { loyaltyPoints: { increment: booking.pointsRedeemed } }
        }),
        prisma.loyaltyHistory.create({
          data: {
            memberId: booking.memberId,
            points: booking.pointsRedeemed,
            type: "EARNED",
            source: "MANUAL",
            description: "Refund for cancelled booking"
          }
        })
      );
    }
    
    queries.push(
      prisma.auditLog.create({
        data: {
          action: "CANCEL_BOOKING",
          entity: "Booking",
          entityId: id,
          details: JSON.stringify({ previousStatus: booking.status })
        }
      })
    );

    await prisma.$transaction(queries);
  }
  
  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
}

export async function rescheduleBooking(id: string, newTurfId: string, newStartTime: Date, newEndTime: Date) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Booking not found");
  if (booking.status === "CANCELLED") throw new Error("Cannot reschedule a cancelled booking");

  // Check for conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      id: { not: id },
      turfId: newTurfId,
      status: { not: "CANCELLED" },
      startTime: { lt: newEndTime },
      endTime: { gt: newStartTime }
    }
  });

  if (conflict) {
    throw new Error("The selected slot is already booked.");
  }

  await prisma.booking.update({
    where: { id },
    data: {
      turfId: newTurfId,
      startTime: newStartTime,
      endTime: newEndTime
    }
  });

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
}

export async function updateBookingPayment(id: string, paymentStatus: "PAID" | "UNPAID") {
  await prisma.booking.update({
    where: { id },
    data: { paymentStatus }
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

  for (const alloc of allocations) {
    if (alloc.isSameCourt && alloc.startTime === booking.endTime.toISOString()) {
      // Update original booking
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          endTime: new Date(alloc.endTime),
          price: booking.price + alloc.price
        }
      });
    } else {
      // Create new booking
      await prisma.booking.create({
        data: {
          turfId: alloc.turfId,
          memberId: booking.memberId,
          sportId: booking.sportId,
          startTime: new Date(alloc.startTime),
          endTime: new Date(alloc.endTime),
          price: alloc.price,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
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

  await bumpSyncTimestamp('admin_booking');
  revalidatePath("/", "layout");
  return { success: true };
}

export async function addPayment(bookingId: string, amount: number, method: "CASH" | "ONLINE") {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true }
  });
  if (!booking) throw new Error("Booking not found");

  await prisma.payment.create({
    data: {
      bookingId,
      amount,
      method
    }
  });

  const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0) + amount;
  
  let newStatus = "UNPAID";
  if (totalPaid >= booking.price) {
    newStatus = "PAID";
  } else if (totalPaid > 0) {
    newStatus = "PARTIAL";
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: newStatus }
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
