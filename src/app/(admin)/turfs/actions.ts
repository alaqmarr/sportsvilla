"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTurf(data: { 
  name: string; 
  location: string; 
  parentTurfId: string | null;
  bookingPrice?: number | null;
  bookingDurationMinutes?: number | null;
  capacityPerSlot?: number;
  bookingValidityDays?: number;
  iconPath?: string;
  sportIds: string[];
}) {
  const turf = await prisma.turf.create({
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
        create: data.sportIds.map(sportId => ({
          sport: { connect: { id: sportId } }
        }))
      }
    },
    include: {
      parentTurf: true,
      childTurfs: true,
      sports: { include: { sport: true } }
    }
  });
  revalidatePath("/", "layout");
  return turf;
}

export async function updateTurf(id: string, data: { 
  name: string; 
  location: string; 
  parentTurfId: string | null;
  bookingPrice?: number | null;
  bookingDurationMinutes?: number | null;
  capacityPerSlot?: number;
  bookingValidityDays?: number;
  iconPath?: string;
  sportIds: string[];
}) {
  // First, delete existing TurfSport links
  await prisma.turfSport.deleteMany({
    where: { turfId: id }
  });

  const turf = await prisma.turf.update({
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
        create: data.sportIds.map(sportId => ({
          sport: { connect: { id: sportId } }
        }))
      }
    },
    include: {
      sports: { include: { sport: true } }
    }
  });
  revalidatePath("/", "layout");
  return turf;
}

export async function deleteTurf(id: string) {
  // TurfSport records will be deleted automatically due to cascade (if configured)
  // But let's delete them manually just to be safe
  await prisma.turfSport.deleteMany({ where: { turfId: id } });
  await prisma.turf.delete({ where: { id } });
  revalidatePath("/", "layout");
}
