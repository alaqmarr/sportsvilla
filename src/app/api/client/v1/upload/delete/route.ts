import { NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { logger } from '@/lib/logger';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { authenticateClient } from '@/lib/auth-middleware';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/upload/delete called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

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

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await s3Client.send(command);

    return jsonResponse({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/upload/delete ->`, error);
    logger.error('Failed to delete file', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
