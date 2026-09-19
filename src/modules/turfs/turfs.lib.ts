import { prisma } from "@/core/database/prisma";

export interface TurfInput {
  name: string;
  location: string;
  parentTurfId: string | null;
  bookingPrice?: number | null;
  bookingDurationMinutes?: number | null;
  capacityPerSlot?: number;
  bookingValidityDays?: number;
  iconPath?: string;
  sportIds: string[];
}

export async function createTurfCore(data: TurfInput) {
  return await prisma.turf.create({
    data: {
      name: data.name,
      location: data.location,
      iconPath: data.iconPath,
      parentTurfId: data.parentTurfId || null,
      bookingPrice: data.bookingPrice || null,
      bookingDurationMinutes: data.bookingDurationMinutes || null,
      capacityPerSlot: data.capacityPerSlot || 1,
      bookingValidityDays: data.bookingValidityDays || 0,
      sports: {
        create: data.sportIds.map((sportId) => ({
          sport: { connect: { id: sportId } },
        })),
      },
    },
    include: {
      parentTurf: true,
      childTurfs: true,
      sports: { include: { sport: true } },
    },
  });
}

export async function updateTurfCore(id: string, data: TurfInput) {
  await prisma.turfSport.deleteMany({
    where: { turfId: id },
  });

  return await prisma.turf.update({
    where: { id },
    data: {
      name: data.name,
      location: data.location,
      iconPath: data.iconPath,
      parentTurfId: data.parentTurfId || null,
      bookingPrice: data.bookingPrice || null,
      bookingDurationMinutes: data.bookingDurationMinutes || null,
      capacityPerSlot: data.capacityPerSlot || 1,
      bookingValidityDays: data.bookingValidityDays || 0,
      sports: {
        create: data.sportIds.map((sportId) => ({
          sport: { connect: { id: sportId } },
        })),
      },
    },
    include: {
      sports: { include: { sport: true } },
    },
  });
}

export async function deleteTurfCore(id: string) {
  await prisma.turfSport.deleteMany({ where: { turfId: id } });
  return await prisma.turf.delete({ where: { id } });
}
