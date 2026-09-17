import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const publicUrlBase = process.env.R2_PUBLIC_URL || "";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const screenGroupId = searchParams.get("screenGroupId");

    if (!screenGroupId) {
      return NextResponse.json({ error: "screenGroupId is required" }, { status: 400 });
    }

    const items = await prisma.tvContentItem.findMany({
      where: { screenGroupId },
      orderBy: { sortOrder: 'asc' },
    });

    const manifestItems = items.map(item => ({
      id: item.id,
      type: item.type,
      url: `${publicUrlBase}/${item.r2Key}`,
      checksum: item.checksum,
      durationSeconds: item.durationSeconds,
      validFrom: item.validFrom ? item.validFrom.toISOString() : null,
      validTo: item.validTo ? item.validTo.toISOString() : null,
    }));

    return NextResponse.json({
      screenGroupId,
      generatedAt: new Date().toISOString(),
      items: manifestItems,
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/admin/tv/manifest-preview ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
