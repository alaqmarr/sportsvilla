"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTurf(data: { name: string; location: string; parentTurfId: string | null }) {
  const turf = await prisma.turf.create({
    data: {
      name: data.name,
      location: data.location,
      parentTurfId: data.parentTurfId || null,
    },
    include: {
      parentTurf: true,
      childTurfs: true,
    }
  });
  revalidatePath("/turfs");
  return turf;
}

export async function updateTurf(id: string, data: { name: string; location: string; parentTurfId: string | null }) {
  const turf = await prisma.turf.update({
    where: { id },
    data: {
      name: data.name,
      location: data.location,
      parentTurfId: data.parentTurfId || null,
    },
  });
  revalidatePath("/turfs");
  return turf;
}

export async function deleteTurf(id: string) {
  await prisma.turf.delete({ where: { id } });
  revalidatePath("/turfs");
}
