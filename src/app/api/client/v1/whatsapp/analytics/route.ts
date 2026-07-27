import { NextResponse } from "next/server";
import { whatsappDb } from "@/lib/whatsappDb";
import { jsonResponse } from "@/lib/api-logger";

export const dynamic = "force-dynamic";

function formatMessagingLimit(tier?: string): string {
  if (!tier) return "1,000 / 24h";
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
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "549503484903993";
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "4575637675998391";

    // 1. Fetch Real-time Number Quality & Limit from Meta Graph API
    let qualityRating = "GREEN";
    let messagingLimit = "1,000 / 24h";

    if (accessToken && phoneNumberId) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,name_status,messaging_limit_tier,status,account_mode`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            next: { revalidate: 0 },
          }
        );
        const data = await res.json();
        if (res.ok && !data.error) {
          if (data.quality_rating) qualityRating = data.quality_rating;
          if (data.messaging_limit_tier) {
            messagingLimit = formatMessagingLimit(data.messaging_limit_tier);
          }
        }
      } catch (err) {
        console.error("[META GRAPH API HEALTH ERROR]", err);
      }
    }

    // 2. Fetch Real-time Templates from Meta Graph API
    let templates: any[] = [];
    if (accessToken && wabaId) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            next: { revalidate: 0 },
          }
        );
        const data = await res.json();
        if (res.ok && data.data) {
          templates = data.data;
        }
      } catch (err) {
        console.error("[META GRAPH API TEMPLATES ERROR]", err);
      }
    }

    // 3. Query Real-time Messaging Funnel from DB
    const [totalSent, totalDelivered, totalRead, totalReplied, totalOptOuts] = await Promise.all([
      whatsappDb.whatsAppMessage.count({ where: { direction: "OUTGOING" } }),
      whatsappDb.whatsAppMessage.count({ where: { direction: "OUTGOING", status: { in: ["DELIVERED", "READ"] } } }),
      whatsappDb.whatsAppMessage.count({ where: { direction: "OUTGOING", status: "READ" } }),
      whatsappDb.whatsAppMessage.count({ where: { direction: "INCOMING" } }),
      whatsappDb.whatsAppMessage.count({ where: { isOptOut: true } }),
    ]);

    // 4. Query Real-time Financials & Billing
    const now = new Date();
    const activeWindows = await whatsappDb.whatsAppConversation.count({
      where: { expiresAt: { gt: now } },
    });

    const conversationGroups = await whatsappDb.whatsAppConversation.groupBy({
      by: ["category"],
      _count: { wacId: true },
      _sum: { cost: true },
    });

    let totalCost = 0;
    let totalConversations = 0;
    const categories = conversationGroups.map((g) => {
      totalCost += g._sum.cost || 0;
      totalConversations += g._count.wacId;
      return {
        category: g.category,
        count: g._count.wacId,
        cost: g._sum.cost || 0,
      };
    });

    const cpc = totalConversations > 0 ? totalCost / totalConversations : 0;

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
        activeWindows,
        categories,
        totalCost,
        totalConversations,
        cpc,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[WHATSAPP ANALYTICS API ERROR]", err);
    return jsonResponse(
      {
        success: false,
        error: err.message || "Failed to load real-time analytics",
      },
      { status: 500 }
    );
  }
}
