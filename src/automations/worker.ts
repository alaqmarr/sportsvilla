/**
 * Automations Background Worker Daemon
 * Standalone PM2-compatible runner that evaluates 5-part cron schedules and executes tasks.
 *
 * Usage:
 *   pm2 start src/automations/worker.ts --name sportsvilla-worker
 *   or: npx tsx src/automations/worker.ts
 */

import { registry } from './registry';
import { runner } from './runner';
import { logger } from '@/core/logging/logger';

/**
 * Matches a single cron field against an integer value.
 * Supports: *, *\/n, n, n-m, n,m
 */
export function matchCronField(field: string, value: number, isDow = false): boolean {
  if (field === '*') return true;

  // Comma-separated list: 1,3,5
  if (field.includes(',')) {
    return field.split(',').some((subField) => matchCronField(subField.trim(), value, isDow));
  }

  // Step intervals: */15
  if (field.startsWith('*/')) {
    const step = parseInt(field.substring(2), 10);
    return !isNaN(step) && step > 0 && value % step === 0;
  }

  // Ranges: 1-5
  if (field.includes('-')) {
    const [minStr, maxStr] = field.split('-');
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return !isNaN(min) && !isNaN(max) && value >= min && value <= max;
  }

  // Exact number
  const target = parseInt(field, 10);
  if (isNaN(target)) return false;

  // Sunday can be 0 or 7 in cron
  if (isDow && target === 7 && value === 0) return true;
  return target === value;
}

/**
 * Evaluates whether a 5-part cron schedule expression matches a given date.
 * Parts: [minute, hour, day of month, month, day of week]
 */
export function matchesCron(schedule: string, date: Date = new Date()): boolean {
  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) {
    logger.warn(`[AutomationWorker] Invalid cron expression: "${schedule}"`);
    return false;
  }

  const [minPart, hourPart, domPart, monthPart, dowPart] = parts;

  const currentMinute = date.getMinutes();
  const currentHour = date.getHours();
  const currentDom = date.getDate();
  const currentMonth = date.getMonth() + 1; // 1-12
  const currentDow = date.getDay(); // 0 (Sun) - 6 (Sat)

  return (
    matchCronField(minPart, currentMinute) &&
    matchCronField(hourPart, currentHour) &&
    matchCronField(domPart, currentDom) &&
    matchCronField(monthPart, currentMonth) &&
    matchCronField(dowPart, currentDow, true)
  );
}

export class AutomationWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastRunRecord: Map<string, string> = new Map();

  public start(pollIntervalMs = 30000) {
    if (this.isRunning) {
      logger.info('[AutomationWorker] Worker is already running');
      return;
    }

    this.isRunning = true;
    logger.info('[AutomationWorker] Initialized SportsVilla automations background daemon', {
      pollIntervalMs,
      registeredTasks: registry.getAllTasks().map((t) => `${t.id} (${t.schedule})`),
    });

    // Execute immediate check on startup
    this.tick();

    // Schedule regular polling loop
    this.timer = setInterval(() => this.tick(), pollIntervalMs);

    // Unref timer so it won't prevent graceful termination
    if (typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    logger.info('[AutomationWorker] Stopped automations background daemon');
  }

  private async tick() {
    const now = new Date();
    const minuteKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;

    const tasks = registry.getEnabledTasks();

    for (const task of tasks) {
      const taskRunKey = `${task.id}@${minuteKey}`;

      // Prevent multiple runs within the same minute
      if (this.lastRunRecord.has(taskRunKey)) {
        continue;
      }

      if (matchesCron(task.schedule, now)) {
        this.lastRunRecord.set(taskRunKey, now.toISOString());

        // Housekeeping: prune run records older than 1 hour to prevent memory leaks
        if (this.lastRunRecord.size > 200) {
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          this.lastRunRecord.forEach((timestamp, key) => {
            if (new Date(timestamp).getTime() < oneHourAgo) {
              this.lastRunRecord.delete(key);
            }
          });
        }

        // Execute task asynchronously
        runner.runTask(task.id).catch((err) => {
          logger.error(`[AutomationWorker] Unhandled task error in ${task.id}:`, err);
        });
      }
    }
  }
}

export const worker = new AutomationWorker();

export function startWorker() {
  worker.start();

  const shutdown = () => {
    logger.info('[AutomationWorker] Received shutdown signal, stopping worker daemon...');
    worker.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Auto-start if executed directly via node or tsx
if (require.main === module || (process.argv[1] && process.argv[1].endsWith('worker.ts'))) {
  startWorker();
}
