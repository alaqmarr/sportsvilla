/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/core/database/prisma";
import { getISTDateBounds } from "@/core/utils/dateUtils";

export async function queryBookableTurfs() {
  return await prisma.turf.findMany({
    where: {
      bookingPrice: { not: null },
      bookingDurationMinutes: { not: null },
    },
    include: { sports: { include: { sport: true } } },
  });
}

export async function queryBookingsByDate(date: string) {
  const { start: startOfDay, end: endOfDay } = getISTDateBounds(date);

  return await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "CANCELLED" },
    },
    include: {
      member: true,
      sport: true,
      turf: true,
      payments: true,
    },
  });
}

export async function queryAllBookingsByDate(date: string) {
  const { start: startOfDay, end: endOfDay } = getISTDateBounds(date);

  return await prisma.booking.findMany({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      member: true,
      sport: true,
      turf: true,
      payments: true,
      tickets: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });
}

export async function searchMemberByMobile(mobile: string) {
  if (mobile.length !== 10) return [];
  return await prisma.member.findMany({ where: { mobile } });
}

export async function searchMemberByCardUid(cardUid: string) {
  const card = await prisma.nfcCard.findFirst({
    where: { cardUid, status: "ACTIVE" },
    include: { member: true },
  });
  if (card && card.member) {
    return card.member;
  }
  return null;
}

export async function checkSlotCapacity(
  tx: any,
  turfId: string,
  startTime: Date,
  endTime: Date,
  requestedParticipants: number,
  excludeBookingId?: string,
): Promise<{
  available: boolean;
  turfCapacity: number;
  usedCapacity: number;
  turfName: string;
}> {
  const turf = await tx.turf.findUnique({ where: { id: turfId } });
  if (!turf) {
    throw new Error("Turf not found");
  }

  const whereClause: any = {
    turfId,
    status: { not: "CANCELLED" },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  };
  if (excludeBookingId) {
    whereClause.id = { not: excludeBookingId };
  }

  const overlappingBookings = await tx.booking.findMany({ where: whereClause });
  const usedCapacity = overlappingBookings.reduce(
    (sum: number, b: any) => sum + (b.participantCount || 0),
    0,
  );
  const turfCapacity = turf.capacityPerSlot || 1;
  const available = requestedParticipants <= turfCapacity - usedCapacity;

  return {
    available,
    turfCapacity,
    usedCapacity,
    turfName: turf.name,
  };
}

export async function resolveOrCreateMember(
  data: { memberId?: string; mobile?: string; name?: string },
  tx?: any,
) {
  const client = tx || prisma;
  let member = null;

  if (data.memberId) {
    member = await client.member.findUnique({ where: { id: data.memberId } });
  } else if (data.mobile && data.name) {
    member = await client.member.findFirst({ where: { mobile: data.mobile } });
    if (!member) {
      const count = await client.member.count({
        where: { mobile: data.mobile },
      });
      const id = `${data.mobile}_${count + 1}`;
      member = await client.member.create({
        data: { id, mobile: data.mobile, name: data.name },
      });
    }
  }

  if (!member) {
    throw new Error("Member information is required");
  }

  return member;
}
