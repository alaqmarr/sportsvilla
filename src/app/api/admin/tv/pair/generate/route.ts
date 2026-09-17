import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { screenId } = body;

    if (!screenId) {
      return NextResponse.json({ error: "screenId is required" }, { status: 400 });
    }

    // Generate 6 digit code
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.tvScreen.update({
      where: { id: screenId },
      data: {
        pairingCode,
        pairingExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({ success: true, pairingCode, expiresAt });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/admin/tv/pair/generate ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
