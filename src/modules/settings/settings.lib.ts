import { prisma } from "@/core/database/prisma";

export interface PhonePeSettingsInput {
  PHONEPE_ENV: string;
  PHONEPE_MERCHANT_ID: string;
  PHONEPE_SALT_KEY: string;
  PHONEPE_SALT_INDEX: string;
  PAYMENT_GATEWAY_ACTIVE: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
}

export async function getSettingsCore() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function updateSettingsCore(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export async function updatePhonePeSettingsCore(data: PhonePeSettingsInput) {
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { key, value: value.toString() },
      });
    }
  }
}
