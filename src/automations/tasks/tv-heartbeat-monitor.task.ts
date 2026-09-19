import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { logger } from '@/core/logging/logger';

export interface TvHeartbeatMonitorOptions {
  heartbeatThresholdMinutes?: number;
}

export interface TvHeartbeatMonitorDetails {
  pairingCodesCleared: number;
  offlineScreensCount: number;
  offlineScreens: Array<{ id: string; label: string; lastHeartbeatAt: Date | null }>;
  errors: string[];
}

export class TvHeartbeatMonitorTask implements AutomationTask<TvHeartbeatMonitorOptions, TvHeartbeatMonitorDetails> {
  readonly id = 'tv-heartbeat-monitor';
  readonly name = 'TV Display Heartbeat & Pairing Code Monitor';
  readonly description = 'Clears expired TV screen pairing codes and detects display screens that have stopped sending heartbeats (>10m).';
  readonly schedule = '*/10 * * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 30000;

  async run(options?: TvHeartbeatMonitorOptions): Promise<TaskResult<TvHeartbeatMonitorDetails>> {
    const thresholdMinutes = options?.heartbeatThresholdMinutes ?? 10;
    const now = new Date();
    const heartbeatCutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    const errors: string[] = [];
    let pairingCodesCleared = 0;
    let offlineScreens: Array<{ id: string; label: string; lastHeartbeatAt: Date | null }> = [];

    // 1. Clear expired pairing codes
    try {
      const clearRes = await prisma.tvScreen.updateMany({
        where: {
          pairingExpiresAt: { lt: now },
          pairingCode: { not: null },
        },
        data: {
          pairingCode: null,
          pairingExpiresAt: null,
        },
      });
      pairingCodesCleared = clearRes.count;
      if (pairingCodesCleared > 0) {
        logger.info(`[TvHeartbeatMonitorTask] Cleared ${pairingCodesCleared} expired TV screen pairing codes`);
      }
    } catch (err: unknown) {
      const msg = `Failed to clear expired TV pairing codes: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    // 2. Identify paired TV screens that are offline (missed heartbeats)
    try {
      offlineScreens = await prisma.tvScreen.findMany({
        where: {
          deviceToken: { not: null },
          OR: [
            { lastHeartbeatAt: { lt: heartbeatCutoff } },
            { lastHeartbeatAt: null },
          ],
        },
        select: {
          id: true,
          label: true,
          lastHeartbeatAt: true,
        },
      });

      if (offlineScreens.length > 0) {
        logger.warn(
          `[TvHeartbeatMonitorTask] Detected ${offlineScreens.length} offline TV screens: ${offlineScreens.map((s) => s.label).join(', ')}`
        );
      }
    } catch (err: unknown) {
      const msg = `Failed to check TV heartbeat telemetry: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: pairingCodesCleared + offlineScreens.length,
      details: {
        pairingCodesCleared,
        offlineScreensCount: offlineScreens.length,
        offlineScreens,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const tvHeartbeatMonitorTask = new TvHeartbeatMonitorTask();
