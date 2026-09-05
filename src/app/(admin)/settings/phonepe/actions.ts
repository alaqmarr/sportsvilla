"use server";

import { prisma } from @/lib/prisma;
import { revalidatePath } from "next/cache";

export async function updatePhonePeSettings(data: {
  PHONEPE_ENV: string;
  PHONEPE_MERCHANT_ID: string;
  PHONEPE_SALT_KEY: string;
  PHONEPE_SALT_INDEX: string;
  PAYMENT_GATEWAY_ACTIVE: string;
}) {
  try {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: value.toString() },
          create: { key, value: value.toString() }
        });
      }
    }
    revalidatePath("/(admin)/settings/phonepe");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating PhonePe settings", error);
    return { success: false, error: error.message };
  }
}
