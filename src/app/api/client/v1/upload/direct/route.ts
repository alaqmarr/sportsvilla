import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';
import { jsonResponse } from '@/lib/api-logger';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/upload/direct called`);
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return jsonResponse({ error: "File is required" }, { status: 400 });
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
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
    logger.error('Failed to upload file directly', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
