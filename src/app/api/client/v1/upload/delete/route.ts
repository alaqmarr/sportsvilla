import { NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3';
import { logger } from '@/lib/logger';

const bucketName = process.env.R2_BUCKET_NAME || '';

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "key or publicUrl is required" }, { status: 400 });
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await s3Client.send(command);

    return NextResponse.json({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    logger.error('Failed to delete file', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
