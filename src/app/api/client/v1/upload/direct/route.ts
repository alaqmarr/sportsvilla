import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { authenticateClient } from '@/lib/auth-middleware';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function POST(request: Request) {
  apiLog(`[API] POST /api/client/v1/upload/direct called`);
  let isAuthenticated = false;
  
  const session = await getServerSession(authOptions);
  
  if (session?.user?.email) {
    isAuthenticated = true;
  } else {
    const authRes = await authenticateClient(request);
    if (!('error' in authRes)) {
      isAuthenticated = true;
    }
  }

  if (!isAuthenticated) {
    return jsonResponse({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return jsonResponse({ error: "File is required" }, { status: 400 });
    }

    // File size limit (100MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: 'File too large. Maximum size is 100MB.' }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
    
    // File type whitelist
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/vnd.android.package-archive'];
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'apk'];
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension.toLowerCase())) {
      return jsonResponse({ error: 'File type not allowed.' }, { status: 400 });
    }

    const contentType = file.type || 'image/jpeg';
    const key = `uploads/${uuidv4()}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Body: buffer,
    });

    await s3Client.send(command);
    
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return jsonResponse({ 
      success: true, 
      publicUrl,
      key 
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/upload/direct ->`, error);
    logger.error('Failed to upload file directly', { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
