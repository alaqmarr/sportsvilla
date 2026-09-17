import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
import crypto from "crypto";

const bucketName = process.env.R2_BUCKET_NAME || "";
const publicUrlBase = process.env.R2_PUBLIC_URL || "";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findFirst({
      where: { email: session.user.email },
    });
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const screenGroupId = formData.get("screenGroupId") as string | null;
    let durationSeconds = formData.get("durationSeconds") as string | null;

    if (!file || !screenGroupId) {
      return NextResponse.json(
        { error: "file and screenGroupId are required" },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    const fileExtension = (file.name.split(".").pop() || "").toLowerCase();
    
    // File validation
    const allowedImageExt = ["jpg", "jpeg", "png"];
    const allowedVideoExt = ["mp4"];
    
    let type = "";
    if (allowedImageExt.includes(fileExtension) || file.type.startsWith("image/")) {
      type = "image";
      if (!durationSeconds) durationSeconds = "10"; // Default duration for image
    } else if (allowedVideoExt.includes(fileExtension) || file.type.startsWith("video/mp4")) {
      type = "video";
      durationSeconds = null; // null for video = play to completion
    } else {
      return NextResponse.json(
        { error: "Only JPG, PNG, and MP4 files are supported." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calculate sha256 checksum
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const r2Key = `tv/media/${hash}.${fileExtension || (type === "image" ? "jpg" : "mp4")}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      ContentType: file.type || (type === "image" ? "image/jpeg" : "video/mp4"),
      Body: buffer,
      CacheControl: "public, max-age=31536000, immutable",
    });

    await s3Client.send(command);

    const publicUrl = `${publicUrlBase}/${r2Key}`;

    // Get max sortOrder for this group
    const maxSort = await prisma.tvContentItem.aggregate({
      where: { screenGroupId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder || 0) + 1;

    const contentItem = await prisma.tvContentItem.create({
      data: {
        screenGroupId,
        type,
        r2Key,
        checksum: `sha256:${hash}`,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : null,
        sortOrder,
      },
    });

    return NextResponse.json({
      success: true,
      item: {
        id: contentItem.id,
        publicUrl,
      }
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/admin/tv/upload ->`, error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message },
      { status: 500 }
    );
  }
}
