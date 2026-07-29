import { NextResponse } from 'next/server';
import { jsonResponse } from '@/lib/api-logger';
import { whatsappDb } from '@/lib/whatsappDb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "4575637675998391";

    if (!accessToken) {
      return jsonResponse({
        success: false,
        error: "WHATSAPP_ACCESS_TOKEN is not configured in .env",
        templates: []
      }, { status: 200 });
    }

    const url = `https://graph.facebook.com/v21.0/${wabaId}/message_templates?limit=100`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (data.error) {
      console.error("[META TEMPLATES ERROR]", data.error);
      return jsonResponse({
        success: false,
        error: data.error.message || "Failed to fetch templates from Meta",
        templates: []
      }, { status: 200 });
    }

    const metaTemplates = data.data || [];
    
    // Fetch local configs
    const localConfigs = await whatsappDb.whatsAppTemplate.findMany();
    const configMap = new Map(localConfigs.map(c => [c.name, c]));

    const mergedTemplates = metaTemplates.map((t: any) => ({
      ...t,
      headerImageUrl: configMap.get(t.name)?.headerImageUrl || null
    }));

    return jsonResponse({
      success: true,
      templates: mergedTemplates
    });
  } catch (err: any) {
    console.error("[TEMPLATES API ERROR]", err);
    return jsonResponse({
      success: false,
      error: err.message || "Internal server error",
      templates: []
    }, { status: 500 });
  }
}
