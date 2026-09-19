import { AutomationTask, TaskResult } from '../types';
import { purgeExpiredRateLimits, getRateLimitStoreSize } from '@/core/http/rate-limit';
import { logger } from '@/core/logging/logger';

export interface RateLimitCleanupDetails {
  purgedEntries: number;
  remainingEntries: number;
  errors: string[];
}

export class RateLimitCleanupTask implements AutomationTask<Record<string, never>, RateLimitCleanupDetails> {
  readonly id = 'rate-limit-cleanup';
  readonly name = 'In-Memory Rate Limit Purge';
  readonly description = 'Evicts expired IP and client endpoint entries from the in-memory rate limit store.';
  readonly schedule = '*/5 * * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 10000;

  async run(): Promise<TaskResult<RateLimitCleanupDetails>> {
    const errors: string[] = [];
    let purgedEntries = 0;
    let remainingEntries = 0;

    try {
      purgedEntries = purgeExpiredRateLimits();
      remainingEntries = getRateLimitStoreSize();

      if (purgedEntries > 0) {
        logger.info(
          `[RateLimitCleanupTask] Purged ${purgedEntries} expired rate limit entries, ${remainingEntries} active remain`
        );
      }
    } catch (err: unknown) {
      const msg = `Failed to purge rate limit memory: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: purgedEntries,
      details: {
        purgedEntries,
        remainingEntries,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const rateLimitCleanupTask = new RateLimitCleanupTask();
