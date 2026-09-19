import { prisma } from "@/core/database/prisma";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/core/storage/s3";
import { v4 as uuidv4 } from "uuid";

export interface CreateBannerInput {
  imageUrl: string;
  title?: string;
  targetSportId?: string;
}

export async function createBannerCore(data: CreateBannerInput) {
  return await prisma.banner.create({
    data: {
      imageUrl: data.imageUrl,
      title: data.title || null,
      targetSportId: data.targetSportId || null,
      isActive: true,
    },
  });
}

export async function toggleBannerStatusCore(id: string, isActive: boolean) {
  return await prisma.banner.update({
    where: { id },
    data: { isActive },
  });
}

export async function deleteBannerCore(id: string) {
  return await prisma.banner.delete({
    where: { id },
  });
}

export async function getAdminPresignedUrlCore(
  contentType: string,
  fileExtension: string
) {
  const bucketName = process.env.R2_BUCKET_NAME || "";
  const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "pdf", "apk"];
  if (!ALLOWED_EXTENSIONS.includes(fileExtension.replace(".", "").toLowerCase())) {
    throw new Error("File type not allowed.");
  }

  const key = `uploads/${uuidv4()}.${fileExtension.replace(".", "")}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

  return { success: true, signedUrl, publicUrl, key };
}
