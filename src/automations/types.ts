/**
 * Automations Framework Core Types
 * Defines the standard contract for background tasks, cron execution, and telemetry.
 */

export interface TaskResult<T = unknown> {
  success: boolean;
  taskId: string;
  durationMs: number;
  processedCount: number;
  details?: T;
  errors?: string[];
  executedAt: Date;
}

export interface AutomationTask<TOptions = Record<string, any>, TResult = unknown> {
  /** Unique task slug, e.g. 'booking-cleanup' */
  readonly id: string;
  /** Human-readable title */
  readonly name: string;
  /** Concise description of what the task executes */
  readonly description: string;
  /** Standard 5-part cron expression (e.g. '*\/15 * * * *') */
  readonly schedule: string;
  /** Whether the task is enabled by default */
  readonly defaultEnabled: boolean;
  /** Maximum execution duration before timing out (milliseconds) */
  readonly timeoutMs?: number;

  /** Primary execution routine */
  run(options?: TOptions): Promise<TaskResult<TResult>>;
}

export interface TaskSummary {
  id: string;
  name: string;
  description: string;
  schedule: string;
  defaultEnabled: boolean;
  timeoutMs?: number;
}
