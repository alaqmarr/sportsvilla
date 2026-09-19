import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/core/auth/serverRbac";
import { PERMISSIONS } from "../permissions";
import { whatsappDb } from "@/core/database/whatsappDb";
import { sendWhatsAppMessage, formatWhatsAppNumber } from "@/modules/whatsapp/whatsapp.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireApiPermission(PERMISSIONS.VIEW_WHATSAPP);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "phoneNumber query param is required", messages: [] },
        { status: 400 }
      );
    }

    const rawPhone = phoneNumber.trim();
    const digitsOnly = rawPhone.replace(/\D/g, "");
    const last10 = digitsOnly.slice(-10);
    const formatted91 = "91" + last10;
    const noPlus = rawPhone.replace(/^\+/, "");

    const candidatePhones = Array.from(
      new Set([rawPhone, noPlus, formatted91, last10, digitsOnly].filter(Boolean))
    );

    const messages = await whatsappDb.whatsAppMessage.findMany({
      where: {
        phoneNumber: { in: candidatePhones },
      },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      phoneNumber: rawPhone,
      messages,
    });
  } catch (err: any) {
    console.error("[API ERROR] GET /api/admin/whatsapp/chat ->", err);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
        messages: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireApiPermission(PERMISSIONS.MANAGE_WHATSAPP);
    if (error) return error;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { phoneNumber, message, contextMessageId } = body || {};

    if (!phoneNumber || typeof phoneNumber !== "string" || !message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "phoneNumber and message are required" },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();
    const res = await sendWhatsAppMessage({
      to: phoneNumber.trim(),
      type: "text",
      text: trimmedMessage,
      metadata: { purpose: "CRM_LIVE_CHAT" },
      contextMessageId: contextMessageId || undefined,
    });

    if (!res.success) {
      return NextResponse.json(
        {
          success: false,
          error: res.error || "Failed to send WhatsApp message",
          code: (res as any).code,
          id: res.id,
        },
        { status: 400 }
      );
    }

    const createdMsg = res.id
      ? await whatsappDb.whatsAppMessage.findUnique({ where: { id: res.id } })
      : null;

    const messageRecord = createdMsg || {
      id: res.id || `msg-${Date.now()}`,
      wamid: (res as any).wamid || null,
      phoneNumber: formatWhatsAppNumber(phoneNumber),
      direction: "OUTGOING",
      type: "TEXT",
      content: trimmedMessage,
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      id: res.id,
      wamid: (res as any).wamid,
      message: messageRecord,
      data: messageRecord,
    });
  } catch (err: any) {
    console.error("[API ERROR] POST /api/admin/whatsapp/chat ->", err);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
      },
      { status: 500 }
    );
  }
}
