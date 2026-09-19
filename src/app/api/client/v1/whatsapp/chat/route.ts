import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/core/auth/auth";
import { whatsappDb } from '@/core/database/whatsappDb';
import { sendWhatsAppMessage } from '@/modules/whatsapp/whatsapp.service';
import { jsonResponse } from '@/core/logging/api-logger';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return jsonResponse({ success: false, error: "phoneNumber query param is required" }, { status: 400 });
    }

    const messages = await whatsappDb.whatsAppMessage.findMany({
      where: { phoneNumber },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    return jsonResponse({
      success: true,
      phoneNumber,
      messages,
    });
  } catch (err: any) {
    console.error("[WHATSAPP CHAT GET ERROR]", err);
    return jsonResponse({
      success: false,
      error: err.message || "Failed to fetch chat messages",
      messages: [],
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return jsonResponse({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { phoneNumber, message, contextMessageId } = await req.json();

    if (!phoneNumber || !message?.trim()) {
      return jsonResponse({ success: false, error: "phoneNumber and message are required" }, { status: 400 });
    }

    const res = await sendWhatsAppMessage({
      to: phoneNumber,
      type: "text",
      text: message.trim(),
      metadata: { purpose: "CRM_LIVE_CHAT" },
      contextMessageId: contextMessageId || undefined,
    });

    if (!res.success) {
      return jsonResponse({ success: false, error: res.error }, { status: 400 });
    }

    return jsonResponse({
      success: true,
      id: res.id,
      wamid: (res as any).wamid,
      message: "Message sent successfully via Meta Cloud API",
    });
  } catch (err: any) {
    console.error("[WHATSAPP CHAT POST ERROR]", err);
    return jsonResponse({
      success: false,
      error: err.message || "Failed to send chat message",
    }, { status: 500 });
  }
}
