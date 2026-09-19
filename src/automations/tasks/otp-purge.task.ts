import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { whatsappDb } from '@/core/database/whatsappDb';
import { logger } from '@/core/logging/logger';

export interface OtpPurgeOptions {
  hoursOld?: number;
}

export interface OtpPurgeDetails {
  primaryOtpPurged: number;
  whatsappOtpPurged: number;
  errors: string[];
}

export class OtpPurgeTask implements AutomationTask<OtpPurgeOptions, OtpPurgeDetails> {
  readonly id = 'otp-purge';
  readonly name = 'Expired OTP Purge';
  readonly description = 'Purges expired OTP verification records older than 24 hours from both the primary database and WhatsApp SQLite database to keep tables lean.';
  readonly schedule = '0 3 * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 30000;

  async run(options?: OtpPurgeOptions): Promise<TaskResult<OtpPurgeDetails>> {
    const hoursOld = options?.hoursOld ?? 24;
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    const errors: string[] = [];
    let primaryOtpPurged = 0;
    let whatsappOtpPurged = 0;

    // 1. Purge expired OTPs from primary database
    try {
      const primaryRes = await prisma.otp.deleteMany({
        where: {
          expiresAt: { lt: cutoff },
        },
      });
      primaryOtpPurged = primaryRes.count;
    } catch (err: unknown) {
      const msg = `Failed to purge OTPs from primary DB: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    // 2. Purge expired OTPs from WhatsApp database
    try {
      const whatsappRes = await whatsappDb.whatsAppOtp.deleteMany({
        where: {
          expiresAt: { lt: cutoff },
        },
      });
      whatsappOtpPurged = whatsappRes.count;
    } catch (err: unknown) {
      const msg = `Failed to purge WhatsApp OTPs: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    const totalPurged = primaryOtpPurged + whatsappOtpPurged;
    logger.info(`[OtpPurgeTask] Purged ${primaryOtpPurged} primary OTPs and ${whatsappOtpPurged} WhatsApp OTPs`);

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: totalPurged,
      details: {
        primaryOtpPurged,
        whatsappOtpPurged,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const otpPurgeTask = new OtpPurgeTask();
