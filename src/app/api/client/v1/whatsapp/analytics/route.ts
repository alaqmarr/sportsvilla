import { NextResponse } from "next/server";
import { jsonResponse, apiLog } from "@/lib/api-logger";

export const dynamic = "force-dynamic";

const META_API_VERSION = "v25.0";

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

export async function GET() {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_WABA_ID;

    if (!accessToken || !phoneNumberId || !wabaId) {
      throw new Error("Missing Meta API Credentials in environment variables. Cannot fetch strict real-time data.");
    }

    const end = Math.floor(Date.now() / 1000);
    const start = end - 30 * 24 * 60 * 60;

    // 1. Fetch Real-time Number Quality & Limit from Meta Graph API
    let qualityRating = "UNKNOWN";
    let messagingLimit = "1,000 / 24h (Standard)";

    const phoneRes = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,name_status,messaging_limit_tier,status,account_mode`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 0 },
      }
    );
    const phoneData = await phoneRes.json();
    if (phoneRes.ok && !phoneData.error) {
      if (phoneData.quality_rating) qualityRating = phoneData.quality_rating;
      messagingLimit = formatMessagingLimit(phoneData.messaging_limit_tier);
    } else {
      apiLog("Meta Phone Number API error in analytics", { error: phoneData.error });
    }

    // 2. Fetch Real-time Templates from Meta Graph API
    let templates: any[] = [];
    const templatesRes = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${wabaId}/message_templates?limit=100`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 0 },
      }
    );
    const templatesData = await templatesRes.json();
    if (templatesRes.ok && templatesData.data) {
      templates = templatesData.data;
    } else {
      apiLog("Meta Templates API error in analytics", { error: templatesData.error });
    }

    // 3. Fetch Real-time Messaging Funnel from Meta Graph API (analytics field on WABA)
    let totalSent = 0;
    let totalDelivered = 0;
    let totalRead = 0;
    let totalReplied = 0;
    let totalOptOuts = 0;

    try {
      const analyticsRes = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}?fields=analytics.start(${start}).end(${end}).granularity(DAY)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 0 },
        }
      );
      const analyticsData = await analyticsRes.json();
      if (analyticsRes.ok && analyticsData.analytics?.data_points) {
        for (const dp of analyticsData.analytics.data_points) {
          totalSent += dp.sent || 0;
          totalDelivered += dp.delivered || 0;
        }
      } else if (analyticsData.error) {
        apiLog("Meta Analytics API error", { error: analyticsData.error });
      }
    } catch (err: any) {
      apiLog("Error fetching WABA analytics", { error: err.message });
    }

    // 4. Fetch Real-time Pricing & Billing from Meta Graph API v25.0 (pricing_analytics)
    // Meta migrated from conversation-based billing to per-message pricing on July 1, 2025.
    // The old conversation_analytics endpoint returns empty; pricing_analytics returns actual data.
    // PRICING_CATEGORY dimension breaks down by SERVICE, UTILITY, MARKETING, AUTHENTICATION.
    let totalVolume = 0;
    let totalCost = 0;
    const categoryMap: Record<string, { volume: number; cost: number }> = {};

    try {
      const pricingRes = await fetch(
        `https://graph.facebook.com/${META_API_VERSION}/${wabaId}?fields=pricing_analytics.start(${start}).end(${end}).granularity(DAILY).dimensions(PRICING_CATEGORY)`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          next: { revalidate: 0 },
        }
      );
      const pricingData = await pricingRes.json();
      if (pricingRes.ok && pricingData.pricing_analytics?.data) {
        for (const row of pricingData.pricing_analytics.data) {
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
      } else if (pricingData.error) {
        apiLog("Meta Pricing Analytics API error", { error: pricingData.error });
      }
    } catch (err: any) {
      apiLog("Error fetching WABA pricing_analytics", { error: err.message });
    }

    const categories = Object.entries(categoryMap).map(([cat, val]) => ({
      category: cat.toLowerCase(),
      count: val.volume,
      cost: Math.round(val.cost * 100) / 100,
    }));

    totalCost = Math.round(totalCost * 100) / 100;
    const cpm = totalVolume > 0 ? Math.round((totalCost / totalVolume) * 10000) / 10000 : 0;

    return jsonResponse({
      success: true,
      accountMetrics: {
        qualityRating,
        messagingLimit,
      },
      templates,
      funnel: {
        sent: totalSent,
        delivered: totalDelivered,
        read: totalRead,
        replied: totalReplied,
        optOuts: totalOptOuts,
      },
      financials: {
        activeWindows: totalVolume,
        categories,
        totalCost,
        totalConversations: totalVolume,
        cpc: cpm,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    apiLog("[WHATSAPP ANALYTICS API ERROR]", { error: err.message || String(err) });
    return jsonResponse(
      {
        success: false,
        error: err.message || "Failed to load real-time analytics from Meta API",
      },
      { status: 500 }
    );
  }
}
