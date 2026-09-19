import { AutomationTask, TaskResult } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '@/core/logging/logger';

export interface LogCleanupOptions {
  maxAgeDays?: number;
}

export interface LogCleanupDetails {
  deletedFiles: string[];
  totalDeleted: number;
  errors: string[];
}

export class LogCleanupTask implements AutomationTask<LogCleanupOptions, LogCleanupDetails> {
  readonly id = 'log-cleanup';
  readonly name = 'Application Log Rotation & File Purge';
  readonly description = 'Removes application log files older than 3 days from the logs directory.';
  readonly schedule = '0 5 * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 30000;

  async run(options?: LogCleanupOptions): Promise<TaskResult<LogCleanupDetails>> {
    const maxAgeDays = options?.maxAgeDays ?? 3;
    const errors: string[] = [];
    const deletedFiles: string[] = [];
    const logDir = path.join(process.cwd(), 'logs');

    try {
      if (!fs.existsSync(logDir)) {
        return {
          success: true,
          taskId: this.id,
          durationMs: 0,
          processedCount: 0,
          details: { deletedFiles: [], totalDeleted: 0, errors: [] },
          executedAt: new Date(),
        };
      }

      const files = fs.readdirSync(logDir);
      const now = Date.now();
      const cutoffMs = maxAgeDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logDir, file);
          try {
            const stats = fs.statSync(filePath);
            const ageMs = now - stats.mtimeMs;
            if (ageMs > cutoffMs) {
              fs.unlinkSync(filePath);
              deletedFiles.push(file);
            }
          } catch (fileErr: unknown) {
            const msg = `Failed to process log file ${file}: ${fileErr instanceof Error ? fileErr.message : String(fileErr)}`;
            errors.push(msg);
          }
        }
      }

      if (deletedFiles.length > 0) {
        logger.info(`[LogCleanupTask] Purged ${deletedFiles.length} old log files: ${deletedFiles.join(', ')}`);
      }
    } catch (dirErr: unknown) {
      const msg = `Failed to read logs directory: ${dirErr instanceof Error ? dirErr.message : String(dirErr)}`;
      logger.error(msg, dirErr);
      errors.push(msg);
    }

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: deletedFiles.length,
      details: {
        deletedFiles,
        totalDeleted: deletedFiles.length,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const logCleanupTask = new LogCleanupTask();
