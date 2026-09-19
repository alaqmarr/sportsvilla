"use server";

import { revalidatePath } from "next/cache";
import {
  createPlanCore,
  updatePlanCore,
  deletePlanCore,
  fetchPlanDetailCore,
  CreatePlanInput,
  UpdatePlanInput,
} from "./plans.lib";

export async function createPlan(data: CreatePlanInput) {
  const plan = await createPlanCore(data);
  revalidatePath("/", "layout");
  return plan;
}

export async function updatePlan(id: string, data: UpdatePlanInput) {
  const plan = await updatePlanCore(id, data);
  revalidatePath("/", "layout");
  return plan;
}

export async function deletePlan(id: string) {
  await deletePlanCore(id);
  revalidatePath("/", "layout");
}

export async function fetchPlanDetail(planId: string) {
  try {
    return await fetchPlanDetailCore(planId);
  } catch (error) {
    console.error("Failed to fetch plan detail", error);
    throw new Error("Failed to fetch plan detail");
  }
}
