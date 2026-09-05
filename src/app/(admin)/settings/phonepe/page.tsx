import { prisma } from @/lib/prisma;
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
          "PAYMENT_GATEWAY_ACTIVE"
        ]
      }
    }
  });

  const initialSettings = settings.reduce((acc, curr) => ({
    ...acc,
    [curr.key]: curr.value
  }), {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Payment Integrations</h1>
      </div>
      <PhonePeClient initialSettings={initialSettings} />
    </div>
  );
}
