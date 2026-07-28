import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { whatsappDb } from "@/lib/whatsappDb";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "WhatsApp Dashboard | SportsVilla Admin",
};

export default async function WhatsAppDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findUnique({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  // 1. Account Metrics & Templates strictly from Meta API
  let qualityRating = "UNKNOWN";
  let messagingLimit = "UNKNOWN";
  let templates: any[] = [];
  let metaApiError = null;

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (accessToken && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,name_status,messaging_limit_tier,status,account_mode`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && !data.error) {
        if (data.quality_rating) qualityRating = data.quality_rating;
        if (data.messaging_limit_tier) {
          const tier = data.messaging_limit_tier.toUpperCase();
          if (tier.includes("50") && !tier.includes("250")) messagingLimit = "50 / 24h";
          else if (tier.includes("250")) messagingLimit = "250 / 24h";
          else if (tier.includes("1K")) messagingLimit = "1,000 / 24h";
          else if (tier.includes("10K")) messagingLimit = "10,000 / 24h";
          else if (tier.includes("100K")) messagingLimit = "100,000 / 24h";
          else if (tier.includes("UNLIMITED")) messagingLimit = "Unlimited";
          else messagingLimit = tier.replace("TIER_", "") + " / 24h";
        }
      } else {
        metaApiError = data.error?.message || "Failed to fetch quality rating";
      }
    } catch (e: any) {
      metaApiError = e.message;
    }
  } else {
    metaApiError = "Missing Meta Credentials in ENV";
  }

  if (accessToken && wabaId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && data.data) {
        templates = data.data;
      }
    } catch (e) {
      // Ignore template fetch error, let it be empty
    }
  }

  const accountMetrics = { qualityRating, messagingLimit };

  // 3. Funnel Metrics
  const totalSent = await whatsappDb.whatsAppMessage.count({
    where: { direction: "OUTGOING" }
  });
  
  const totalDelivered = await whatsappDb.whatsAppMessage.count({
    where: { direction: "OUTGOING", status: { in: ["DELIVERED", "READ"] } }
  });
  
  const totalRead = await whatsappDb.whatsAppMessage.count({
    where: { direction: "OUTGOING", status: "READ" }
  });
  
  const totalReplied = await whatsappDb.whatsAppMessage.count({
    where: { direction: "INCOMING" }
  });

  const totalOptOuts = await whatsappDb.whatsAppMessage.count({
    where: { isOptOut: true }
  });

  // 4. Financial & Billing
  const now = new Date();
  
  const activeWindows = await whatsappDb.whatsAppConversation.count({
    where: { expiresAt: { gt: now } }
  });

  // Aggregate cost by category
  const conversationGroups = await whatsappDb.whatsAppConversation.groupBy({
    by: ["category"],
    _count: { wacId: true },
    _sum: { cost: true }
  });

  let totalCost = 0;
  let totalConversations = 0;
  const categories = conversationGroups.map(g => {
    totalCost += (g._sum.cost || 0);
    totalConversations += g._count.wacId;
    return {
      category: g.category,
      count: g._count.wacId,
      cost: g._sum.cost || 0
    };
  });

  const cpc = totalConversations > 0 ? (totalCost / totalConversations) : 0;

  return (
    <DashboardClient 
      accountMetrics={accountMetrics}
      templates={templates}
      funnel={{
        sent: totalSent,
        delivered: totalDelivered,
        read: totalRead,
        replied: totalReplied,
        optOuts: totalOptOuts
      }}
      financials={{
        activeWindows,
        categories,
        totalCost,
        totalConversations,
        cpc
      }}
      initialError={metaApiError}
    />
  );
}
