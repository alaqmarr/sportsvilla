import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { authenticateClient } from '@/lib/auth-middleware';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/upload/presigned-url called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  try {
    const { contentType, fileExtension } = await request.json();

    if (!contentType || !fileExtension) {
      return jsonResponse({ error: "contentType and fileExtension are required" }, { status: 400 });
    }

    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'apk'];
    if (!ALLOWED_EXTENSIONS.includes(fileExtension.replace('.', '').toLowerCase())) {
      return jsonResponse({ error: 'File type not allowed.' }, { status: 400 });
    }

    const key = `uploads/${uuidv4()}.${fileExtension.replace('.', '')}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // URL expires in 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    
    // Cloudflare public R2 URL format depends on if it's connected to a custom domain.
    // We will assume `process.env.R2_PUBLIC_URL` holds the base URL for public access.
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return jsonResponse({ 
      success: true, 
      signedUrl, 
      publicUrl,
      key 
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/upload/presigned-url ->`, error);
    logger.error('Failed to generate presigned URL', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
