import { NextRequest, NextResponse } from "next/server";
import { authenticateTvDevice } from "@/lib/tv-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const screen = await authenticateTvDevice(req);
    if (!screen) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { currentItemId, cacheUsedBytes, appVersion } = body;

    // Single indexed upsert/update by screen id
    await prisma.tvScreen.update({
      where: { id: screen.id },
      data: {
        lastHeartbeatAt: new Date(),
        currentItemId,
        cacheUsedBytes: cacheUsedBytes != null ? BigInt(cacheUsedBytes) : null,
        appVersion
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/tv/heartbeat ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
