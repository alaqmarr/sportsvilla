import { AutomationTask, TaskResult } from '../types';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { logger } from '@/core/logging/logger';

export interface R2CleanupOptions {
  daysOld?: number;
  qrHoursOld?: number;
}

export interface R2CleanupDetails {
  uploadsDeleted: number;
  tempQrDeleted: number;
  errors: string[];
}

export class R2StorageCleanupTask implements AutomationTask<R2CleanupOptions, R2CleanupDetails> {
  readonly id = 'r2-storage-cleanup';
  readonly name = 'Cloudflare R2 Storage Cleanup';
  readonly description = 'Purges stale payment proof uploads older than 14 days and ephemeral QR tickets older than 1 hour from Cloudflare R2.';
  readonly schedule = '0 2 * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 120000; // 2 minutes

  private getS3Client(): { client: S3Client; bucketName: string } | null {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || 'sportsvilla-assets';
    const endpoint = process.env.R2_ENDPOINT ||
      (process.env.CLOUDFLARE_ACCOUNT_ID ? `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com` : '');

    if (!accessKeyId || !secretAccessKey || !endpoint) {
      return null;
    }

    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return { client, bucketName };
  }

  async run(options?: R2CleanupOptions): Promise<TaskResult<R2CleanupDetails>> {
    const errors: string[] = [];
    let uploadsDeleted = 0;
    let tempQrDeleted = 0;

    const r2Config = this.getS3Client();
    if (!r2Config) {
      logger.info('[R2StorageCleanupTask] Cloudflare R2 storage credentials not configured, skipping cleanup.');
      return {
        success: true,
        taskId: this.id,
        durationMs: 0,
        processedCount: 0,
        details: { uploadsDeleted: 0, tempQrDeleted: 0, errors: [] },
        executedAt: new Date()
      };
    }

    const { client, bucketName } = r2Config;
    const daysOld = options?.daysOld ?? 14;
    const qrHoursOld = options?.qrHoursOld ?? 1;

    const uploadsCutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const tempQrCutoff = new Date(Date.now() - qrHoursOld * 60 * 60 * 1000);

    // 1. Purge stale uploads older than 14 days
    try {
      let isTruncated = true;
      let continuationToken: string | undefined;

      while (isTruncated) {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: 'uploads/',
          ContinuationToken: continuationToken,
        });

        const response = await client.send(listCommand);
        const candidates = (response.Contents || [])
          .filter(obj => obj.Key && obj.LastModified && new Date(obj.LastModified) < uploadsCutoff)
          .map(obj => ({ Key: obj.Key! }));

        if (candidates.length > 0) {
          // Batch in chunks of 1000 per S3 API limits
          for (let i = 0; i < candidates.length; i += 1000) {
            const batch = candidates.slice(i, i + 1000);
            await client.send(new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: { Objects: batch, Quiet: true }
            }));
            uploadsDeleted += batch.length;
          }
        }

        isTruncated = response.IsTruncated || false;
        continuationToken = response.NextContinuationToken;
      }
    } catch (err: unknown) {
      const msg = `Failed to purge R2 uploads/: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    // 2. Purge ephemeral QR tickets older than 1 hour
    try {
      let isTruncated = true;
      let continuationToken: string | undefined;

      while (isTruncated) {
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: 'temp-qr/',
          ContinuationToken: continuationToken,
        });

        const response = await client.send(listCommand);
        const candidates = (response.Contents || [])
          .filter(obj => obj.Key && obj.LastModified && new Date(obj.LastModified) < tempQrCutoff)
          .map(obj => ({ Key: obj.Key! }));

        if (candidates.length > 0) {
          for (let i = 0; i < candidates.length; i += 1000) {
            const batch = candidates.slice(i, i + 1000);
            await client.send(new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: { Objects: batch, Quiet: true }
            }));
            tempQrDeleted += batch.length;
          }
        }

        isTruncated = response.IsTruncated || false;
        continuationToken = response.NextContinuationToken;
      }
    } catch (err: unknown) {
      const msg = `Failed to purge R2 temp-qr/: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    const totalDeleted = uploadsDeleted + tempQrDeleted;
    logger.info(`[R2StorageCleanupTask] Finished cleanup: ${uploadsDeleted} uploads, ${tempQrDeleted} temp QR codes deleted`);

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: totalDeleted,
      details: {
        uploadsDeleted,
        tempQrDeleted,
        errors
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date()
    };
  }
}

export const r2StorageCleanupTask = new R2StorageCleanupTask();
