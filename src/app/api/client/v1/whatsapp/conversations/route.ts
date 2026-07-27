import { NextResponse } from 'next/server';
import { whatsappDb } from '@/lib/whatsappDb';
import { prisma } from '@/lib/prisma';
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
          unreadCount: msg.direction === "INCOMING" && (msg.status === "RECEIVED" || !msg.status) ? 1 : 0,
        });
      } else {
        existing.totalMessages += 1;
        if (msg.direction === "INCOMING" && !existing.lastIncomingAt) {
          existing.lastIncomingAt = msg.createdAt;
        }
        if (msg.direction === "INCOMING" && (msg.status === "RECEIVED" || !msg.status)) {
          existing.unreadCount = (existing.unreadCount || 0) + 1;
        }
      }
    }

    // Lookup matching customer names in main Member database by 10-digit mobile
    const phoneNumbers = Array.from(conversationMap.keys());
    const tenDigitMap = new Map<string, string>();
    phoneNumbers.forEach((phone) => {
      const tenDigits = phone.replace(/\D/g, "").slice(-10);
      if (tenDigits.length === 10) {
        tenDigitMap.set(tenDigits, phone);
      }
    });

    const matchingMembers = await prisma.member.findMany({
      where: {
        mobile: {
          in: Array.from(tenDigitMap.keys()),
        },
      },
      orderBy: {
        createdAt: 'asc', // Guarantee oldest (primary) member comes first
      },
      select: {
        id: true,
        name: true,
        mobile: true,
      },
    });

    const memberByPhone = new Map<string, { id: string; name: string }>();
    matchingMembers.forEach((m) => {
      const originalPhone = tenDigitMap.get(m.mobile);
      if (originalPhone && !memberByPhone.has(originalPhone)) {
        memberByPhone.set(originalPhone, { id: m.id, name: m.name });
      }
    });

    const conversations = Array.from(conversationMap.values()).map((conv) => {
      // Check if 24-hour customer window is open
      let is24HourWindowOpen = false;
      if (conv.lastIncomingAt) {
        const hoursDiff = (Date.now() - new Date(conv.lastIncomingAt).getTime()) / (1000 * 60 * 60);
        is24HourWindowOpen = hoursDiff <= 24;
      }
      const matchedMember = memberByPhone.get(conv.phoneNumber);
      return {
        ...conv,
        memberName: matchedMember?.name || null,
        memberId: matchedMember?.id || null,
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
