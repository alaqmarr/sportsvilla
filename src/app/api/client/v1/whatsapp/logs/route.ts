import { NextResponse } from 'next/server';
import { whatsappDb } from '@/lib/whatsappDb';
import { jsonResponse } from '@/lib/api-logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const messages = await whatsappDb.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const otps = await whatsappDb.whatsAppOtp.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const webhookLogs = await whatsappDb.whatsAppWebhookLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return jsonResponse({
      success: true,
      messages,
      otps,
      webhookLogs,
    });
  } catch (err: any) {
    console.error("[WHATSAPP LOGS API ERROR]", err);
    return jsonResponse({
      success: false,
      error: err.message || "Failed to fetch WhatsApp logs",
      messages: [],
      otps: [],
    }, { status: 500 });
  }
}
