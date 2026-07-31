import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/rbac";
import DashboardClient from "./DashboardClient";

export const metadata = {
  title: "WhatsApp Dashboard | SportsVilla Admin",
};

function formatMessagingLimit(tier?: string): string {
  if (!tier) return "1,000 / 24h (Standard)";
  const upper = tier.toUpperCase();
  if (upper.includes("50") && !upper.includes("250")) return "50 / 24h";
  if (upper.includes("250")) return "250 / 24h";
  if (upper.includes("1K")) return "1,000 / 24h";
  if (upper.includes("10K")) return "10,000 / 24h";
  if (upper.includes("100K")) return "100,000 / 24h";
  if (upper.includes("UNLIMITED")) return "Unlimited";
  return tier.replace("TIER_", "") + " / 24h";
}

const META_API_VERSION = "v25.0";

export default async function WhatsAppDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const admin = await prisma.admin.findFirst({ where: { email: session.user.email } });
  if (!admin || (!hasPermission(admin, "view:whatsapp") && !hasPermission(admin, "manage:whatsapp"))) {
    redirect("/admin");
  }

  let qualityRating = "UNKNOWN";
  let messagingLimit = "1,000 / 24h (Standard)";
  let templates: any[] = [];
  let metaApiError = null;

  let totalSent = 0;
  let totalDelivered = 0;
  let totalRead = 0;
  let totalReplied = 0;
  let totalOptOuts = 0;

  let totalVolume = 0;
  let totalCost = 0;
  const categoryMap: Record<string, { volume: number; cost: number }> = {};

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_WABA_ID;

  const end = Math.floor(Date.now() / 1000);
  const start = end - 30 * 24 * 60 * 60;

  if (accessToken && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,name_status,messaging_limit_tier,status,account_mode`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && !data.error) {
        if (data.quality_rating) qualityRating = data.quality_rating;
        messagingLimit = formatMessagingLimit(data.messaging_limit_tier);
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
    // 1. Templates
    try {
      const res = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/message_templates?limit=100`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && data.data) {
        templates = data.data;
      }
    } catch (e) {
      // Ignore template fetch error
    }

    // 2. Funnel Metrics (Sent, Delivered) from WABA analytics endpoint
    try {
      const res = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}?fields=analytics.start(${start}).end(${end}).granularity(DAY)`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && data.analytics?.data_points) {
        for (const dp of data.analytics.data_points) {
          totalSent += dp.sent || 0;
          totalDelivered += dp.delivered || 0;
        }
      }
    } catch (e) {
      // Ignore funnel fetch error
    }

    // 3. Pricing Analytics with PRICING_CATEGORY dimension (replaces deprecated conversation_analytics)
    // Meta migrated to per-message pricing on July 1, 2025; conversation_analytics returns empty.
    // pricing_analytics on v25.0 returns actual volume + cost broken down by PRICING_CATEGORY (SERVICE, UTILITY, MARKETING, AUTHENTICATION).
    try {
      const res = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}?fields=pricing_analytics.start(${start}).end(${end}).granularity(DAILY).dimensions(PRICING_CATEGORY)`,
        { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" }
      );
      const data = await res.json();
      if (res.ok && data.pricing_analytics?.data) {
        for (const row of data.pricing_analytics.data) {
          if (row.data_points) {
            for (const dp of row.data_points) {
              const cat = dp.pricing_category || "SERVICE";
              const cost = Number(dp.cost) || 0;
              const volume = Number(dp.volume) || 0;
              if (!categoryMap[cat]) {
                categoryMap[cat] = { volume: 0, cost: 0 };
              }
              categoryMap[cat].volume += volume;
              categoryMap[cat].cost += cost;
              totalCost += cost;
              totalVolume += volume;
            }
          }
        }
      }
    } catch (e) {
      // Ignore pricing fetch error
    }
  }

  const accountMetrics = { qualityRating, messagingLimit };

  const categories = Object.entries(categoryMap).map(([cat, val]) => ({
    category: cat.toLowerCase(),
    count: val.volume,
    cost: Math.round(val.cost * 100) / 100,
  }));

  totalCost = Math.round(totalCost * 100) / 100;
  const cpm = totalVolume > 0 ? Math.round((totalCost / totalVolume) * 10000) / 10000 : 0;

  return (
    <DashboardClient
      accountMetrics={accountMetrics}
      templates={templates}
      funnel={{
        sent: totalSent,
        delivered: totalDelivered,
        read: totalRead,
        replied: totalReplied,
        optOuts: totalOptOuts,
      }}
      financials={{
        activeWindows: totalVolume,
        categories,
        totalCost,
        totalConversations: totalVolume,
        cpc: cpm,
      }}
      initialError={metaApiError}
    />
  );
}

