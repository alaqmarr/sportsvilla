import { AutomationTask, TaskSummary } from './types';
import { bookingCleanupTask } from './tasks/booking-cleanup.task';
import { r2StorageCleanupTask } from './tasks/r2-storage-cleanup.task';
import { membershipExpiryTask } from './tasks/membership-expiry.task';
import { bookingCompletionTask } from './tasks/booking-completion.task';
import { otpPurgeTask } from './tasks/otp-purge.task';
import { whatsAppLogPurgeTask } from './tasks/whatsapp-log-purge.task';
import { couponExpiryTask } from './tasks/coupon-expiry.task';
import { tournamentLifecycleTask } from './tasks/tournament-lifecycle.task';
import { tvHeartbeatMonitorTask } from './tasks/tv-heartbeat-monitor.task';
import { logCleanupTask } from './tasks/log-cleanup.task';
import { rateLimitCleanupTask } from './tasks/rate-limit-cleanup.task';

export class AutomationRegistry {
  private tasks: Map<string, AutomationTask> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    this.register(bookingCleanupTask);
    this.register(r2StorageCleanupTask);
    this.register(membershipExpiryTask);
    this.register(bookingCompletionTask);
    this.register(otpPurgeTask);
    this.register(whatsAppLogPurgeTask);
    this.register(couponExpiryTask);
    this.register(tournamentLifecycleTask);
    this.register(tvHeartbeatMonitorTask);
    this.register(logCleanupTask);
    this.register(rateLimitCleanupTask);
  }

  public register(task: AutomationTask): void {
    this.tasks.set(task.id, task);
  }

  public getTask(id: string): AutomationTask | undefined {
    return this.tasks.get(id);
  }

  public hasTask(id: string): boolean {
    return this.tasks.has(id);
  }

  public getAllTasks(): AutomationTask[] {
    return Array.from(this.tasks.values());
  }

  public getEnabledTasks(): AutomationTask[] {
    return this.getAllTasks().filter((t) => t.defaultEnabled);
  }

  public getSummaries(): TaskSummary[] {
    return this.getAllTasks().map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      schedule: t.schedule,
      defaultEnabled: t.defaultEnabled,
      timeoutMs: t.timeoutMs,
    }));
  }
}

export const registry = new AutomationRegistry();
