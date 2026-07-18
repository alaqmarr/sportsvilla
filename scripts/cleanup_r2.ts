// To run this script:
// npx ts-node scripts/cleanup_r2.ts
// You can schedule this using a CRON job on your server or Vercel Crons.

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const bucketName = process.env.R2_BUCKET_NAME || '';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  }
});

async function runCleanup() {
  console.log('Starting R2 Cleanup for screenshots older than 14 days...');
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  try {
    let isTruncated = true;
    let continuationToken: string | undefined;

    while (isTruncated) {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'uploads/',
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(listCommand);
      
      const objectsToDelete = response.Contents?.filter(obj => {
        if (obj.LastModified) {
          return new Date(obj.LastModified) < fourteenDaysAgo;
        }
        return false;
      }).map(obj => ({ Key: obj.Key }));

      if (objectsToDelete && objectsToDelete.length > 0) {
        console.log(`Deleting ${objectsToDelete.length} old screenshots...`);
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: objectsToDelete,
            Quiet: false,
          }
        });
        await s3Client.send(deleteCommand);
      }

      isTruncated = response.IsTruncated || false;
      continuationToken = response.NextContinuationToken;
    }

    console.log('Cleanup completed successfully.');
  } catch (error) {
    console.error('Failed to cleanup R2:', error);
  }
}

runCleanup();
