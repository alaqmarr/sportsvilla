import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { logger } from '@/core/logging/logger';
import { bumpSyncTimestamp } from '@/core/database/sync';
import { sendWhatsAppMembershipExpiringTemplate } from '@/modules/whatsapp/membership-expiring.template';
import { sendPushNotificationToMember } from '@/modules/notifications/notifications.services';

export interface MembershipExpiryOptions {
  reminderDays?: number[];
}

export interface MembershipExpiryDetails {
  expiredTransitions: number;
  remindersSent: number;
  errors: string[];
}

export class MembershipExpiryTask implements AutomationTask<MembershipExpiryOptions, MembershipExpiryDetails> {
  readonly id = 'membership-expiry';
  readonly name = 'Membership Expiry & Renewal Reminders';
  readonly description = 'Transitions expired memberships to EXPIRED status and sends automated WhatsApp & push notifications for upcoming expirations at T-7, T-3, and T-1 days.';
  readonly schedule = '30 2 * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 180000; // 3 minutes

  async run(options?: MembershipExpiryOptions): Promise<TaskResult<MembershipExpiryDetails>> {
    const errors: string[] = [];
    let expiredTransitions = 0;
    let remindersSent = 0;
    const now = new Date();

    // 1. Part A: Transition active memberships whose endDate has passed
    try {
      const expiredMemberships = await prisma.memberMembership.updateMany({
        where: {
          status: 'ACTIVE',
          endDate: { lt: now },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      expiredTransitions = expiredMemberships.count;
      if (expiredTransitions > 0) {
        logger.info(`[MembershipExpiryTask] Transitioned ${expiredTransitions} memberships to EXPIRED`);
        await bumpSyncTimestamp('member');
      }
    } catch (err: unknown) {
      const msg = `Failed to transition expired memberships: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    // 2. Part B: Send upcoming expiry notifications (T-7, T-3, T-1 days)
    const reminderDays = options?.reminderDays ?? [7, 3, 1];

    for (const days of reminderDays) {
      try {
        const targetDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

        const expiringSoon = await prisma.memberMembership.findMany({
          where: {
            status: 'ACTIVE',
            endDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            member: true,
            membershipPlan: true,
          },
        });

        for (const membership of expiringSoon) {
          const member = membership.member;
          const plan = membership.membershipPlan;
          if (!member || !plan) continue;

          const formattedDate = new Date(membership.endDate).toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          // Send WhatsApp Notification
          if (member.mobile) {
            try {
              await sendWhatsAppMembershipExpiringTemplate(member.mobile, {
                customerName: member.name,
                planName: plan.name,
                expirationDate: formattedDate,
                registeredPhone: member.mobile,
              });
              remindersSent++;
            } catch (waErr) {
              logger.warn(`[MembershipExpiryTask] WhatsApp alert failed for ${member.mobile}:`, waErr);
            }
          }

          // Send companion Push Notification
          try {
            await sendPushNotificationToMember(
              member.id,
              'Membership Expiring Soon',
              `Your ${plan.name} membership expires in ${days} day${days > 1 ? 's' : ''} on ${formattedDate}. Renew now to continue enjoying your member benefits!`,
              {
                type: 'MEMBERSHIP_EXPIRING',
                membershipId: membership.id,
                daysRemaining: days,
              }
            );
          } catch (pushErr) {
            logger.warn(`[MembershipExpiryTask] Push alert failed for member ${member.id}:`, pushErr);
          }
        }
      } catch (err: unknown) {
        const msg = `Failed to process renewal reminders for T-${days}d: ${err instanceof Error ? err.message : String(err)}`;
        logger.error(msg, err);
        errors.push(msg);
      }
    }

    const totalProcessed = expiredTransitions + remindersSent;

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: totalProcessed,
      details: {
        expiredTransitions,
        remindersSent,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const membershipExpiryTask = new MembershipExpiryTask();
