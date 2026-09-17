import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";

const bucketName = process.env.R2_BUCKET_NAME || "";
const publicUrlBase = process.env.R2_PUBLIC_URL || "";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { screenGroupId } = body;

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

    const manifest = {
      screenGroupId,
      generatedAt: new Date().toISOString(),
      items: manifestItems,
    };

    const manifestJson = JSON.stringify(manifest, null, 2);
    const r2Key = `tv/manifests/${screenGroupId}.json`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      ContentType: "application/json",
      Body: manifestJson,
      CacheControl: "public, max-age=60", // Short TTL
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      manifestUrl: `${publicUrlBase}/${r2Key}`,
      generatedAt: manifest.generatedAt
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/admin/tv/publish ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
