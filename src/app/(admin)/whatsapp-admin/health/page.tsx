import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import HealthClient from "./HealthClient";
import { whatsappDb } from "@/lib/whatsappDb";

export const metadata = {
  title: "WhatsApp Health | SportsVilla Admin",
};

const DEFAULT_INTRO = `Welcome to *SportsVilla*! 🏆\nThank you for reaching out. Our automated sports booking & tournament platform is currently in active beta.\n\nFor immediate assistance, booking inquiries, or support, please contact Alaqmar directly:\n📞 *Phone / WhatsApp*: +91 9618443558\n🌐 *Website*: https://sportsvilla.co.in\n\nWe will get back to you shortly!`;

export default async function WhatsAppHealthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  // Fetch configs
  const configs = await whatsappDb.whatsAppConfig.findMany();
  const configMap: Record<string, string> = {};
  for (const c of configs) {
    configMap[c.key] = c.value;
  }

  const autoReply = {
    enabled: configMap["AUTO_REPLY_ENABLED"] !== "false", // Default true
    message: configMap["AUTO_REPLY_MESSAGE"] || DEFAULT_INTRO,
    cooldownMinutes: parseInt(configMap["AUTO_REPLY_COOLDOWN_MINUTES"] || "10", 10) || 10,
  };

  // Stats
  const totalMessages = await whatsappDb.whatsAppMessage.count();
  const incomingMessages = await whatsappDb.whatsAppMessage.count({ where: { direction: "INCOMING" } });
  const outgoingMessages = await whatsappDb.whatsAppMessage.count({ where: { direction: "OUTGOING" } });
  const deliveredMessages = await whatsappDb.whatsAppMessage.count({
    where: { status: { in: ["DELIVERED", "READ"] } },
  });
  const webhookLogsCount = await whatsappDb.whatsAppWebhookLog.count();

  // Active phone numbers
  const distinctPhones = await whatsappDb.whatsAppMessage.findMany({
    select: { phoneNumber: true },
    distinct: ["phoneNumber"],
  });

  // Meta API
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  let metaPhoneInfo: any = null;
  let metaApiError: string | null = null;

  if (token && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,name_status,messaging_limit_tier,status,account_mode`,
        {
          headers: { Authorization: `Bearer ${token}` },
          next: { revalidate: 0 },
        }
      );
      const data = await res.json();
      if (res.ok && !data.error) {
        metaPhoneInfo = data;
      } else {
        metaApiError = data.error?.message || `Meta API returned HTTP ${res.status}`;
      }
    } catch (err: any) {
      metaApiError = err.message || "Failed to reach Meta Graph API";
    }
  } else {
    metaApiError = "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID in .env";
  }

  const healthData = {
    database: {
      status: "ONLINE",
      sqlitePath: "whatsapp.db",
      stats: {
        totalMessages,
        incomingMessages,
        outgoingMessages,
        deliveredMessages,
        activeNumbersCount: distinctPhones.length,
        webhookLogsCount,
      },
    },
    env: {
      hasToken: Boolean(token),
      hasPhoneNumberId: Boolean(phoneNumberId),
      hasWabaId: Boolean(wabaId),
      hasVerifyToken: Boolean(verifyToken),
    },
    metaPhoneInfo: metaPhoneInfo,
    metaApiError,
  };

  return <HealthClient initialHealthData={healthData} initialAutoReply={autoReply} />;
}
