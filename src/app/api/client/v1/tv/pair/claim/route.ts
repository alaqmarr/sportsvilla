import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/database/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pairingCode, deviceInfo } = body;

    if (!pairingCode) {
      return NextResponse.json({ error: "pairingCode is required" }, { status: 400 });
    }

    // --- MASTER BYPASS CODE FOR APP STORE REVIEWERS ---
    if (pairingCode === "515253") {
      let group = await prisma.tvScreenGroup.findFirst({
        where: { name: "App Store Reviewers" }
      });
      if (!group) {
        group = await prisma.tvScreenGroup.create({
          data: { name: "App Store Reviewers" }
        });
      }

      let screen = await prisma.tvScreen.findFirst({
        where: { label: "Google Play Review Device" }
      });
      
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      if (!screen) {
        screen = await prisma.tvScreen.create({
          data: {
            label: "Google Play Review Device",
            screenGroupId: group.id,
            deviceToken: hashedToken
          }
        });
      } else {
        screen = await prisma.tvScreen.update({
          where: { id: screen.id },
          data: { deviceToken: hashedToken }
        });
      }

      return NextResponse.json({
        success: true,
        deviceToken: token,
        screenId: screen.id,
        screenGroupId: group.id,
      });
    }
    // ----------------------------------------------------

    const screen = await prisma.tvScreen.findFirst({
      where: {
        pairingCode,
        pairingExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!screen) {
      return NextResponse.json({ error: "Invalid or expired pairing code" }, { status: 400 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Save hashed token and invalidate code
    await prisma.tvScreen.update({
      where: { id: screen.id },
      data: {
        deviceToken: hashedToken,
        pairingCode: null,
        pairingExpiresAt: null,
      }
    });

    return NextResponse.json({
      success: true,
      deviceToken: token,
      screenId: screen.id,
      screenGroupId: screen.screenGroupId,
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/tv/pair/claim ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
