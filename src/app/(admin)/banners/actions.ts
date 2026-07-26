"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';

export async function createBanner(data: {
  imageUrl: string;
  title?: string;
  targetSportId?: string;
}) {
  const banner = await prisma.banner.create({
    data: {
      imageUrl: data.imageUrl,
      title: data.title || null,
      targetSportId: data.targetSportId || null,
      isActive: true,
    }
  });

  revalidatePath("/", "layout");
  return banner;
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  await prisma.banner.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath("/", "layout");
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({
    where: { id }
  });
  revalidatePath("/", "layout");
}

export async function getAdminPresignedUrl(contentType: string, fileExtension: string) {
  const bucketName = process.env.R2_BUCKET_NAME || '';
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'apk'];
  if (!ALLOWED_EXTENSIONS.includes(fileExtension.replace('.', '').toLowerCase())) {
    throw new Error('File type not allowed.');
  }

  const key = `uploads/${uuidv4()}.${fileExtension.replace('.', '')}`;
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { success: true, signedUrl, publicUrl, key };
}
