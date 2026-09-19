import { NextResponse } from 'next/server';
import { whatsappDb } from '@/core/database/whatsappDb';
import { jsonResponse } from '@/core/logging/api-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      // No active session or missing request context
    }
    if (!session?.user?.email) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
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
