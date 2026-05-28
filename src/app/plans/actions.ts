"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlan(data: { name: string; sportId: string; durationInDays: number; price: number; slotsPerDay: number }) {
  const plan = await prisma.membershipPlan.create({
    data: {
      name: data.name,
      sportId: data.sportId,
      durationInDays: data.durationInDays,
      price: data.price,
      slotsPerDay: data.slotsPerDay,
    },
    include: {
      sport: true,
    }
  });
  revalidatePath("/plans");
  return plan;
}

export async function updatePlan(id: string, data: { name: string; sportId: string; durationInDays: number; price: number; slotsPerDay: number }) {
  const plan = await prisma.membershipPlan.update({
    where: { id },
    data: {
      name: data.name,
      sportId: data.sportId,
      durationInDays: data.durationInDays,
      price: data.price,
      slotsPerDay: data.slotsPerDay,
    },
  });
  revalidatePath("/plans");
  return plan;
}

export async function deletePlan(id: string) {
  await prisma.membershipPlan.delete({ where: { id } });
  revalidatePath("/plans");
}
