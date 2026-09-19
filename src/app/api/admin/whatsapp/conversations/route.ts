import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/core/auth/serverRbac";
import { PERMISSIONS } from "../permissions";
import { whatsappDb } from "@/core/database/whatsappDb";
import { prisma } from "@/core/database/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireApiPermission(PERMISSIONS.VIEW_WHATSAPP);
    if (error) return error;

    const allMessages = await whatsappDb.whatsAppMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const conversationMap = new Map<
      string,
      {
        phoneNumber: string;
        lastMessage: string;
        lastDirection: string;
        lastStatus: string;
        updatedAt: Date;
        lastMessageTime: string;
        lastIncomingAt: Date | null;
        totalMessages: number;
        unreadCount: number;
        is24HourWindowOpen: boolean;
        memberName: string | null;
        name: string;
        memberId: string | null;
        member: { id: string; name: string; email: string | null } | null;
      }
    >();

    for (const msg of allMessages) {
      if (!msg.phoneNumber) continue;
      const normalizedPhone = msg.phoneNumber.replace(/^\+/, "");
      const existing = conversationMap.get(normalizedPhone);

      const isIncoming = msg.direction === "INCOMING";
      const isUnread = isIncoming && msg.status !== "READ";

      if (!existing) {
        conversationMap.set(normalizedPhone, {
          phoneNumber: normalizedPhone,
          lastMessage: msg.content || "",
          lastDirection: msg.direction,
          lastStatus: msg.status,
          updatedAt: msg.createdAt,
          lastMessageTime: msg.createdAt.toISOString(),
          lastIncomingAt: isIncoming ? msg.createdAt : null,
          totalMessages: 1,
          unreadCount: isUnread ? 1 : 0,
          is24HourWindowOpen: false,
          memberName: null,
          name: normalizedPhone,
          memberId: null,
          member: null,
        });
      } else {
        existing.totalMessages += 1;
        if (isIncoming && !existing.lastIncomingAt) {
          existing.lastIncomingAt = msg.createdAt;
        }
        if (isUnread) {
          existing.unreadCount += 1;
        }
      }
    }

    // Correlate members from prisma.member by 10-digit mobile number
    const phoneNumbers = Array.from(conversationMap.keys());
    const tenDigitMap = new Map<string, string>();
    phoneNumbers.forEach((phone) => {
      const tenDigits = phone.replace(/\D/g, "").slice(-10);
      if (tenDigits.length === 10) {
        tenDigitMap.set(tenDigits, phone);
      }
    });

    if (tenDigitMap.size > 0) {
      const matchingMembers = await prisma.member.findMany({
        where: {
          mobile: {
            in: Array.from(tenDigitMap.keys()),
          },
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
        },
      });

      const memberByPhone = new Map<string, { id: string; name: string; email: string | null }>();
      matchingMembers.forEach((m) => {
        const originalPhone = tenDigitMap.get(m.mobile);
        if (originalPhone && !memberByPhone.has(originalPhone)) {
          memberByPhone.set(originalPhone, { id: m.id, name: m.name, email: m.email });
        }
      });

      memberByPhone.forEach((memberInfo, phone) => {
        const conv = conversationMap.get(phone);
        if (conv) {
          conv.memberName = memberInfo.name;
          conv.name = memberInfo.name;
          conv.memberId = memberInfo.id;
          conv.member = memberInfo;
        }
      });
    }

    const conversations = Array.from(conversationMap.values()).map((conv) => {
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

    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    console.error("[API ERROR] GET /api/admin/whatsapp/conversations ->", error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
        conversations: [],
      },
      { status: 500 }
    );
  }
}
