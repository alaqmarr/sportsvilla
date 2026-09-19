"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import {
  getSettingsCore,
  updateSettingsCore,
  updatePhonePeSettingsCore,
  PhonePeSettingsInput,
} from "./settings.lib";

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Admin session required");
  }
  return session;
}

export async function getSettings() {
  await requireAdminSession();
  return await getSettingsCore();
}

export async function updateSettings(data: Record<string, string>) {
  await requireAdminSession();
  await updateSettingsCore(data);
  revalidatePath("/", "layout");
}

export async function updatePhonePeSettings(data: PhonePeSettingsInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { success: false, error: "Unauthorized: Admin session required" };
    }

    await updatePhonePeSettingsCore(data);
    revalidatePath("/(admin)/settings/phonepe");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating PhonePe settings", error);
    return { success: false, error: error.message };
  }
}
