import { AutomationTask, TaskResult } from '../types';
import { whatsappDb } from '@/core/database/whatsappDb';
import { logger } from '@/core/logging/logger';

export interface WhatsAppLogPurgeOptions {
  retentionDays?: number;
}

export interface WhatsAppLogPurgeDetails {
  deletedLogsCount: number;
  walCheckpointSuccessful: boolean;
  errors: string[];
}

export class WhatsAppLogPurgeTask implements AutomationTask<WhatsAppLogPurgeOptions, WhatsAppLogPurgeDetails> {
  readonly id = 'whatsapp-log-purge';
  readonly name = 'WhatsApp Webhook Log Retention Cleanup';
  readonly description = 'Prunes raw WhatsApp webhook audit logs older than 30 days and executes an SQLite WAL checkpoint to maintain database performance.';
  readonly schedule = '0 4 * * 0';
  readonly defaultEnabled = true;
  readonly timeoutMs = 60000;

  async run(options?: WhatsAppLogPurgeOptions): Promise<TaskResult<WhatsAppLogPurgeDetails>> {
    const retentionDays = options?.retentionDays ?? 30;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const errors: string[] = [];
    let deletedLogsCount = 0;
    let walCheckpointSuccessful = false;

    // 1. Purge old webhook logs
    try {
      const deleteRes = await whatsappDb.whatsAppWebhookLog.deleteMany({
        where: {
          createdAt: { lt: cutoff },
        },
      });
      deletedLogsCount = deleteRes.count;
      logger.info(`[WhatsAppLogPurgeTask] Purged ${deletedLogsCount} webhook logs older than ${retentionDays} days`);
    } catch (err: unknown) {
      const msg = `Failed to purge WhatsApp webhook logs: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    // 2. Perform SQLite WAL checkpoint to prevent unbounded WAL file growth
    try {
      await whatsappDb.$executeRawUnsafe('PRAGMA wal_checkpoint(TRUNCATE);');
      walCheckpointSuccessful = true;
      logger.info('[WhatsAppLogPurgeTask] Successfully executed PRAGMA wal_checkpoint(TRUNCATE)');
    } catch (checkpointErr: unknown) {
      const msg = `WAL checkpoint warning: ${checkpointErr instanceof Error ? checkpointErr.message : String(checkpointErr)}`;
      logger.warn(msg);
    }

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: deletedLogsCount,
      details: {
        deletedLogsCount,
        walCheckpointSuccessful,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const whatsAppLogPurgeTask = new WhatsAppLogPurgeTask();
