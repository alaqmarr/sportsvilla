"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSport(data: { name: string; description: string }) {
  const sport = await prisma.sport.create({
    data: { name: data.name, description: data.description },
  });
  revalidatePath("/", "layout");
  return sport;
}

export async function updateSport(id: string, data: { name: string; description: string }) {
  const sport = await prisma.sport.update({
    where: { id },
    data: { name: data.name, description: data.description },
  });
  revalidatePath("/", "layout");
  return sport;
}

export async function deleteSport(id: string) {
  await prisma.sport.delete({ where: { id } });
  revalidatePath("/", "layout");
}
