import { prisma } from "@/core/database/prisma";
import { getISTStartOfMonth } from "@/core/utils/dateUtils";

export interface CreatePlanInput {
  name: string;
  sportId: string;
  durationInDays: number;
  price: number;
  slotsPerDay: number;
  isFamilyPlan: boolean;
  familySize?: number | null;
  rewardPointsOnPurchase: number;
  rewardPointsPerCheckin: number;
}

export interface UpdatePlanInput {
  name: string;
  sportId: string;
  durationInDays: number;
  price: number;
  slotsPerDay: number;
  isFamilyPlan: boolean;
  familySize?: number | null;
  rewardPointsOnPurchase: number;
  rewardPointsPerCheckin: number;
}

export async function createPlanCore(data: CreatePlanInput) {
  return await prisma.membershipPlan.create({
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
    },
  });
}

export async function updatePlanCore(id: string, data: UpdatePlanInput) {
  return await prisma.membershipPlan.update({
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
}

export async function deletePlanCore(id: string) {
  return await prisma.membershipPlan.delete({ where: { id } });
}

export async function fetchPlanDetailCore(planId: string) {
  const startOfMonth = getISTStartOfMonth();

  const plan = await prisma.membershipPlan.findUnique({
    where: { id: planId },
    include: {
      sport: true,
      memberships: {
        include: {
          member: {
            include: {
              attendances: {
                where: {
                  date: { gte: startOfMonth },
                },
              },
            },
          },
        },
        orderBy: {
          endDate: "desc",
        },
      },
    },
  });

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan;
}
