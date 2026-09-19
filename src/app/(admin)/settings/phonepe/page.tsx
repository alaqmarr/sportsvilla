import { prisma } from "@/core/database/prisma";
import PhonePeClient from "./PhonePeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PhonePe Settings | Admin",
};

export default async function PhonePeSettingsPage() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          "PHONEPE_ENV",
          "PHONEPE_MERCHANT_ID",
          "PHONEPE_SALT_KEY",
          "PHONEPE_SALT_INDEX",
          "PAYMENT_GATEWAY_ACTIVE",
          "RAZORPAY_KEY_ID",
          "RAZORPAY_KEY_SECRET"
        ]
      }
    }
  });

  const defaultSettings: Record<string, string> = {
    PHONEPE_ENV: "UAT",
    PHONEPE_MERCHANT_ID: "",
    PHONEPE_SALT_KEY: "",
    PHONEPE_SALT_INDEX: "1",
    PAYMENT_GATEWAY_ACTIVE: "NONE",
    RAZORPAY_KEY_ID: "",
    RAZORPAY_KEY_SECRET: ""
  };

  const initialSettings = settings.reduce((acc, curr) => ({
    ...acc,
    [curr.key]: curr.value
  }), {} as Record<string, string>);

  // Seed missing settings
  for (const [key, defaultValue] of Object.entries(defaultSettings)) {
    if (initialSettings[key] === undefined) {
      await prisma.setting.upsert({
        where: { key },
        update: {},
        create: { key, value: defaultValue }
      });
      initialSettings[key] = defaultValue;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Payment Integrations</h1>
      </div>
      <PhonePeClient initialSettings={initialSettings} />
    </div>
  );
}
