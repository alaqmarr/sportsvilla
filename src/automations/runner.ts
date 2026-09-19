import { Mutex } from '@/core/utils/mutex';
import { logger } from '@/core/logging/logger';
import { AutomationTask, TaskResult } from './types';
import { registry } from './registry';

export class AutomationRunner {
  private activeLocks: Set<string> = new Set();

  public isTaskRunning(taskId: string): boolean {
    return this.activeLocks.has(taskId);
  }

  public async runTask<TOptions = Record<string, any>, TResult = unknown>(
    taskId: string,
    options?: TOptions
  ): Promise<TaskResult<TResult>> {
    const task = registry.getTask(taskId) as AutomationTask<TOptions, TResult> | undefined;
    if (!task) {
      const errorMsg = `Task '${taskId}' not found in registry`;
      logger.error(`[AutomationRunner] ${errorMsg}`);
      return {
        success: false,
        taskId,
        durationMs: 0,
        processedCount: 0,
        errors: [errorMsg],
        executedAt: new Date(),
      };
    }

    const lockKey = `automation:${task.id}`;
    const timeoutMs = task.timeoutMs || 60000;
    const lockTtlMs = timeoutMs + 10000;

    // Mutex concurrency lock to prevent overlapping runs across workers or serverless instances
    const acquired = await Mutex.acquire(lockKey, 1000, lockTtlMs);
    if (!acquired) {
      logger.warn(`[AutomationRunner] Task '${task.id}' is currently running or locked. Skipping execution.`);
      return {
        success: false,
        taskId: task.id,
        durationMs: 0,
        processedCount: 0,
        errors: [`Task '${task.id}' is currently running or locked by another worker`],
        executedAt: new Date(),
      };
    }

    this.activeLocks.add(task.id);
    const startTime = Date.now();
    logger.info(`[AutomationRunner] Executing task '${task.id}' (schedule: ${task.schedule})`, {
      taskId: task.id,
      schedule: task.schedule,
    });

    let timeoutTimer: NodeJS.Timeout | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutTimer = setTimeout(() => {
          reject(new Error(`Task '${task.id}' execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      const executionPromise = task.run(options);
      const result = await Promise.race([executionPromise, timeoutPromise]);

      const durationMs = Date.now() - startTime;
      logger.info(
        `[AutomationRunner] Task '${task.id}' completed in ${durationMs}ms with ${result.processedCount} processed items`,
        {
          taskId: task.id,
          durationMs,
          processedCount: result.processedCount,
          success: result.success,
        }
      );

      return {
        ...result,
        durationMs: result.durationMs > 0 ? result.durationMs : durationMs,
        executedAt: result.executedAt || new Date(),
      };
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[AutomationRunner] Task '${task.id}' failed after ${durationMs}ms: ${errorMsg}`, {
        taskId: task.id,
        durationMs,
        error: errorMsg,
      });

      return {
        success: false,
        taskId: task.id,
        durationMs,
        processedCount: 0,
        errors: [errorMsg],
        executedAt: new Date(),
      };
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      this.activeLocks.delete(task.id);
      Mutex.release(lockKey);
    }
  }

  public async runAllTasks(options?: Record<string, any>): Promise<TaskResult[]> {
    const tasks = registry.getEnabledTasks();
    const results: TaskResult[] = [];

    for (const task of tasks) {
      const result = await this.runTask(task.id, options);
      results.push(result);
    }

    return results;
  }
}

export const runner = new AutomationRunner();
