import { NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/core/storage/s3';
import { logger } from '@/core/logging/logger';
import { jsonResponse, apiLog } from '@/core/logging/api-logger';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/auth';
import { prisma } from '@/core/database/prisma';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/upload/delete called`);

  // 1. Check if caller has an active Admin session
  const adminSession = await getServerSession(authOptions);
  const isAdmin = !!adminSession?.user?.email;

  // 2. If not admin, authenticate client session
  let member: any = null;
  if (!isAdmin) {
    const authRes = await authenticateClient(request);
    if ('error' in authRes) return authRes.error;
    member = authRes.member;
  }

  try {
    const { key, publicUrl } = await request.json();

    let objectKey = key;

    // If only publicUrl is provided, extract the key
    if (!objectKey && publicUrl) {
      const publicUrlBase = process.env.R2_PUBLIC_URL || '';
      if (publicUrlBase && publicUrl.startsWith(publicUrlBase)) {
        objectKey = publicUrl.replace(`${publicUrlBase}/`, '');
      } else {
        // Attempt fallback extraction if publicUrlBase isn't set properly
        const urlParts = new URL(publicUrl);
        objectKey = urlParts.pathname.substring(1); // remove leading slash
      }
    }

    if (!objectKey) {
      return jsonResponse({ error: "key or publicUrl is required" }, { status: 400 });
    }

    // Path traversal and directory jail check
    if (objectKey.includes('..') || !objectKey.startsWith('uploads/')) {
      return jsonResponse({ error: "Invalid file key path" }, { status: 400 });
    }

    // IDOR Protection: Non-admins cannot delete APKs or system assets
    if (!isAdmin) {
      if (objectKey.toLowerCase().endsWith('.apk')) {
        return jsonResponse(
          { error: "Forbidden: Admin privileges required to delete application packages" },
          { status: 403 }
        );
      }

      const [isAppVersion, isBanner, isAnnouncement, isSport, isTurf, isTournament] = await Promise.all([
        prisma.appVersion.findFirst({
          where: { OR: [{ fileKey: objectKey }, { downloadUrl: { contains: objectKey } }] },
          select: { id: true }
        }),
        prisma.banner.findFirst({
          where: { imageUrl: { contains: objectKey } },
          select: { id: true }
        }),
        prisma.appAnnouncement.findFirst({
          where: { imageUrl: { contains: objectKey } },
          select: { id: true }
        }),
        prisma.sport.findFirst({
          where: { iconPath: { contains: objectKey } },
          select: { id: true }
        }),
        prisma.turf.findFirst({
          where: { iconPath: { contains: objectKey } },
          select: { id: true }
        }),
        prisma.tournament.findFirst({
          where: { thumbnail: { contains: objectKey } },
          select: { id: true }
        })
      ]);

      if (isAppVersion || isBanner || isAnnouncement || isSport || isTurf || isTournament) {
        return jsonResponse(
          { error: "Forbidden: Admin privileges required to delete system resources" },
          { status: 403 }
        );
      }

      // Verify ownership if file is attached to a tournament registration
      const registration = await prisma.tournamentRegistration.findFirst({
        where: { paymentScreenshotUrl: { contains: objectKey } },
        include: { registeredBy: true }
      });

      if (registration) {
        const isOwner =
          registration.registeredById === member.id ||
          (member.familyId && registration.registeredBy?.familyId === member.familyId) ||
          (member.mobile && registration.registeredBy?.mobile === member.mobile);

        if (!isOwner) {
          return jsonResponse({ error: "Forbidden: You do not own this file" }, { status: 403 });
        }
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await s3Client.send(command);

    return jsonResponse({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/upload/delete ->`, error);
    logger.error('Failed to delete file', { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}

