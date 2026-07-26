"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function getAppVersions() {
  const versions = await prisma.appVersion.findMany();
  return versions;
}

export async function saveAppVersion(data: {
  platform: string;
  version: string;
  forceUpdate: boolean;
  downloadUrl: string;
  fileKey?: string;
  releaseNotes?: string;
}) {
  const existing = await prisma.appVersion.findUnique({
    where: { platform: data.platform },
  });

  if (existing && existing.fileKey && data.fileKey && existing.fileKey !== data.fileKey) {
    // New APK uploaded, delete the old one from R2
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: existing.fileKey,
      });
      await s3Client.send(command);
    } catch (e) {
      console.error("Failed to delete old APK from R2", e);
    }
  }

  await prisma.appVersion.upsert({
    where: { platform: data.platform },
    update: {
      version: data.version,
      forceUpdate: data.forceUpdate,
      downloadUrl: data.downloadUrl,
      fileKey: data.fileKey,
      releaseNotes: data.releaseNotes,
    },
    create: {
      platform: data.platform,
      version: data.version,
      forceUpdate: data.forceUpdate,
      downloadUrl: data.downloadUrl,
      fileKey: data.fileKey,
      releaseNotes: data.releaseNotes,
    },
  });

  revalidatePath("/app-versions");
}
