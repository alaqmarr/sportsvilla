"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlan(data: { name: string; sportId: string; durationInDays: number; price: number; slotsPerDay: number; isFamilyPlan: boolean; familySize?: number | null; rewardPointsOnPurchase: number; rewardPointsPerCheckin: number }) {
  const plan = await prisma.membershipPlan.create({
    data: {
      name: data.name,
      sport: { connect: { id: data.sportId } },
      durationInDays: data.durationInDays,
      price: data.price,
      slotsPerDay: data.slotsPerDay,
      isFamilyPlan: data.isFamilyPlan,
      familySize: data.familySize,
      rewardPointsOnPurchase: data.rewardPointsOnPurchase,
      rewardPointsPerCheckin: data.rewardPointsPerCheckin,
    },
    include: {
      sport: true,
    }
  });
  revalidatePath("/", "layout");
  return plan;
}

export async function updatePlan(id: string, data: { name: string; sportId: string; durationInDays: number; price: number; slotsPerDay: number; isFamilyPlan: boolean; familySize?: number | null; rewardPointsOnPurchase: number; rewardPointsPerCheckin: number }) {
  const plan = await prisma.membershipPlan.update({
    where: { id },
    data: {
      name: data.name,
      sport: { connect: { id: data.sportId } },
      durationInDays: data.durationInDays,
      price: data.price,
      slotsPerDay: data.slotsPerDay,
      isFamilyPlan: data.isFamilyPlan,
      familySize: data.familySize,
      rewardPointsOnPurchase: data.rewardPointsOnPurchase,
      rewardPointsPerCheckin: data.rewardPointsPerCheckin,
    },
  });
  revalidatePath("/", "layout");
  return plan;
}

export async function deletePlan(id: string) {
  await prisma.membershipPlan.delete({ where: { id } });
  revalidatePath("/", "layout");
}
