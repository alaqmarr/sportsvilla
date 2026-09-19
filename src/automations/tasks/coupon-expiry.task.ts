import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { logger } from '@/core/logging/logger';

export interface CouponExpiryDetails {
  deactivatedCoupons: number;
  errors: string[];
}

export class CouponExpiryTask implements AutomationTask<Record<string, never>, CouponExpiryDetails> {
  readonly id = 'coupon-expiry';
  readonly name = 'Coupon Expiration Maintenance';
  readonly description = 'Automatically deactivates promotional coupons whose expiration dates have passed.';
  readonly schedule = '0 0 * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 30000;

  async run(): Promise<TaskResult<CouponExpiryDetails>> {
    const now = new Date();
    const errors: string[] = [];
    let deactivatedCoupons = 0;

    try {
      const result = await prisma.coupon.updateMany({
        where: {
          expiryDate: { lt: now },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      deactivatedCoupons = result.count;
      if (deactivatedCoupons > 0) {
        logger.info(`[CouponExpiryTask] Deactivated ${deactivatedCoupons} expired coupons`);
      }
    } catch (err: unknown) {
      const msg = `Failed to expire coupons: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: deactivatedCoupons,
      details: {
        deactivatedCoupons,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const couponExpiryTask = new CouponExpiryTask();
