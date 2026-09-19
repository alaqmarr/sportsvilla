import { prisma } from "@/core/database/prisma";

export interface SportDataInput {
  name: string;
  description: string;
  rewardPointsPerCheckin: number;
  iconPath?: string;
  openTime?: string;
  closeTime?: string;
  slotDurationMinutes?: number;
}

export interface TurfAssociationInput {
  id?: string;
  isNew: boolean;
  name?: string;
  bookingPrice: number;
  capacityPerSlot: number;
  iconPath?: string;
}

export async function createSportCore(
  data: SportDataInput,
  turfs: TurfAssociationInput[]
) {
  return await prisma.$transaction(async (tx) => {
    const turfIds: string[] = [];
    for (const t of turfs) {
      if (t.isNew) {
        const newTurf = await tx.turf.create({
          data: {
            name: t.name || "Unnamed Turf",
            bookingPrice: t.bookingPrice,
            capacityPerSlot: t.capacityPerSlot,
            iconPath: t.iconPath || null,
          },
        });
        turfIds.push(newTurf.id);
      } else if (t.id) {
        await tx.turf.update({
          where: { id: t.id },
          data: {
            bookingPrice: t.bookingPrice,
            capacityPerSlot: t.capacityPerSlot,
            iconPath: t.iconPath || null,
          },
        });
        turfIds.push(t.id);
      }
    }

    return await tx.sport.create({
      data: {
        name: data.name,
        description: data.description,
        rewardPointsPerCheckin: data.rewardPointsPerCheckin,
        iconPath: data.iconPath,
        openTime: data.openTime ?? "06:00",
        closeTime: data.closeTime ?? "23:00",
        slotDurationMinutes: data.slotDurationMinutes ?? 60,
        turfs: {
          create: turfIds.map((tid) => ({ turfId: tid })),
        },
      },
    });
  });
}

export async function updateSportCore(
  id: string,
  data: SportDataInput,
  turfs: TurfAssociationInput[]
) {
  return await prisma.$transaction(async (tx) => {
    const turfIds: string[] = [];
    for (const t of turfs) {
      if (t.isNew) {
        const newTurf = await tx.turf.create({
          data: {
            name: t.name || "Unnamed Turf",
            bookingPrice: t.bookingPrice,
            capacityPerSlot: t.capacityPerSlot,
            iconPath: t.iconPath || null,
          },
        });
        turfIds.push(newTurf.id);
      } else if (t.id) {
        await tx.turf.update({
          where: { id: t.id },
          data: {
            bookingPrice: t.bookingPrice,
            capacityPerSlot: t.capacityPerSlot,
            iconPath: t.iconPath || null,
          },
        });
        turfIds.push(t.id);
      }
    }

    await tx.turfSport.deleteMany({
      where: { sportId: id },
    });

    return await tx.sport.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        rewardPointsPerCheckin: data.rewardPointsPerCheckin,
        iconPath: data.iconPath,
        openTime: data.openTime ?? "06:00",
        closeTime: data.closeTime ?? "23:00",
        slotDurationMinutes: data.slotDurationMinutes ?? 60,
        turfs: {
          create: turfIds.map((tid) => ({ turfId: tid })),
        },
      },
    });
  });
}

export async function deleteSportCore(id: string) {
  return await prisma.sport.delete({ where: { id } });
}
