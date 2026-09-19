import { NextRequest, NextResponse } from "next/server";
import { requireApiPermission } from "@/core/auth/serverRbac";
import { PERMISSIONS } from "../permissions";
import { whatsappDb } from "@/core/database/whatsappDb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireApiPermission(PERMISSIONS.VIEW_WHATSAPP);
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

    const { phoneNumber } = body || {};

    if (!phoneNumber || typeof phoneNumber !== "string" || !phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "phoneNumber is required" },
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

    const updateResult = await whatsappDb.whatsAppMessage.updateMany({
      where: {
        phoneNumber: { in: candidatePhones },
        direction: "INCOMING",
        status: {
          not: "READ",
        },
      },
      data: {
        status: "READ",
      },
    });

    return NextResponse.json({
      success: true,
      count: updateResult.count,
    });
  } catch (err: any) {
    console.error("[API ERROR] POST /api/admin/whatsapp/mark-read ->", err);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
      },
      { status: 500 }
    );
  }
}
