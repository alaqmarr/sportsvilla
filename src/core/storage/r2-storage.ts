import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let r2ClientInstance: S3Client | null = null;
let cachedEndpointUrl = "";

function getR2Client(): S3Client | null {
  if (r2ClientInstance) return r2ClientInstance;

  const accountId = process.env.R2_ACCOUNT_ID || '';
  cachedEndpointUrl = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

  if (!cachedEndpointUrl) return null;

  r2ClientInstance = new S3Client({
    region: 'auto',
    endpoint: cachedEndpointUrl,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });

  return r2ClientInstance;
}

export async function uploadTempQRToR2(buffer: Buffer, key: string): Promise<string> {
  const client = getR2Client();
  if (!client) {
    console.warn("R2 storage not configured (missing R2_ENDPOINT or R2_ACCOUNT_ID), skipping QR upload.");
    return "";
  }
  
  const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sportsvilla-assets';
  const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_URL || 'https://assets.sportsvilla.co.in';

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    CacheControl: 'max-age=86400', // 1 day
  });

  await client.send(command);
  return `${PUBLIC_DOMAIN}/${key}`;
}

export async function deleteTempQRFromR2(key: string): Promise<void> {
  const client = getR2Client();
  if (!client) return;
  
  const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sportsvilla-assets';

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    await client.send(command);
    console.log(`[R2] Deleted temp QR: ${key}`);
  } catch (error) {
    console.error(`[R2] Failed to delete temp QR ${key}:`, error);
  }
}
