import { NextResponse } from 'next/server';
import { whatsappDb } from '@/lib/whatsappDb';
import { jsonResponse } from '@/lib/api-logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allMessages = await whatsappDb.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const conversationMap = new Map<string, any>();

    for (const msg of allMessages) {
      if (!msg.phoneNumber) continue;
      const existing = conversationMap.get(msg.phoneNumber);

      // Track last message for the conversation
      if (!existing) {
        conversationMap.set(msg.phoneNumber, {
          phoneNumber: msg.phoneNumber,
          lastMessage: msg.content,
          lastDirection: msg.direction,
          lastStatus: msg.status,
          updatedAt: msg.createdAt,
          lastIncomingAt: msg.direction === "INCOMING" ? msg.createdAt : null,
          totalMessages: 1,
        });
      } else {
        existing.totalMessages += 1;
        if (msg.direction === "INCOMING" && !existing.lastIncomingAt) {
          existing.lastIncomingAt = msg.createdAt;
        }
      }
    }

    const conversations = Array.from(conversationMap.values()).map((conv) => {
      // Check if 24-hour customer window is open
      let is24HourWindowOpen = false;
      if (conv.lastIncomingAt) {
        const hoursDiff = (Date.now() - new Date(conv.lastIncomingAt).getTime()) / (1000 * 60 * 60);
        is24HourWindowOpen = hoursDiff <= 24;
      }
      return {
        ...conv,
        is24HourWindowOpen,
      };
    });

    return jsonResponse({
      success: true,
      conversations,
    });
  } catch (err: any) {
    console.error("[WHATSAPP CONVERSATIONS API ERROR]", err);
    return jsonResponse({
      success: false,
      error: err.message || "Failed to fetch WhatsApp conversations",
      conversations: [],
    }, { status: 500 });
  }
}
