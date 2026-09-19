import { NextRequest, NextResponse } from "next/server";
import { authenticateTvDevice } from "@/modules/tv/tv-auth.lib";

const publicUrlBase = process.env.R2_PUBLIC_URL || "";

export async function GET(req: NextRequest) {
  try {
    const screen = await authenticateTvDevice(req);
    if (!screen) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const r2Key = `tv/manifests/${screen.screenGroupId}.json`;
    const manifestUrl = `${publicUrlBase}/${r2Key}`;

    return NextResponse.json({
      success: true,
      manifestUrl,
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/tv/manifest ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
