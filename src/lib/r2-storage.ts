import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sportsvilla-assets';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || 'https://assets.sportsvilla.co.in';

export async function uploadTempQRToR2(buffer: Buffer, key: string): Promise<string> {
  if (!process.env.R2_ENDPOINT) {
    console.warn("R2 storage not configured, skipping QR upload.");
    return "";
  }
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    CacheControl: 'max-age=86400', // 1 day
  });

  await r2Client.send(command);
  return `${PUBLIC_DOMAIN}/${key}`;
}

export async function deleteTempQRFromR2(key: string): Promise<void> {
  if (!process.env.R2_ENDPOINT) return;
  
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await r2Client.send(command);
    console.log(`[R2] Deleted temp QR: ${key}`);
  } catch (error) {
    console.error(`[R2] Failed to delete temp QR ${key}:`, error);
  }
}
