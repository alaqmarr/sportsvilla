import { AutomationTask, TaskResult } from '../types';
import { prisma } from '@/core/database/prisma';
import { logger } from '@/core/logging/logger';
import { bumpSyncTimestamp } from '@/core/database/sync';

export interface TournamentLifecycleDetails {
  transitionedToOngoing: number;
  transitionedToCompleted: number;
  closedRegistrationsCount: number;
  errors: string[];
}

export class TournamentLifecycleTask implements AutomationTask<Record<string, never>, TournamentLifecycleDetails> {
  readonly id = 'tournament-lifecycle';
  readonly name = 'Tournament Lifecycle & Registration Locks';
  readonly description = 'Advances tournament lifecycle statuses (UPCOMING -> ONGOING -> COMPLETED) based on start dates, end dates, and registration deadlines.';
  readonly schedule = '*/30 * * * *';
  readonly defaultEnabled = true;
  readonly timeoutMs = 60000;

  async run(): Promise<TaskResult<TournamentLifecycleDetails>> {
    const now = new Date();
    const errors: string[] = [];
    let transitionedToOngoing = 0;
    let transitionedToCompleted = 0;
    let closedRegistrationsCount = 0;

    try {
      // 1. Check tournaments where registration deadline has passed but still UPCOMING
      const closedRegs = await prisma.tournament.count({
        where: {
          status: 'UPCOMING',
          registrationDeadline: { lt: now },
        },
      });
      closedRegistrationsCount = closedRegs;

      // 2. Transition UPCOMING tournaments whose startDate has arrived to ONGOING
      const ongoingResult = await prisma.tournament.updateMany({
        where: {
          status: 'UPCOMING',
          startDate: { lte: now },
        },
        data: {
          status: 'ONGOING',
        },
      });
      transitionedToOngoing = ongoingResult.count;

      // 3. Transition ONGOING tournaments whose endDate has passed to COMPLETED
      const completedResult = await prisma.tournament.updateMany({
        where: {
          status: 'ONGOING',
          endDate: {
            not: null,
            lte: now,
          },
        },
        data: {
          status: 'COMPLETED',
        },
      });
      transitionedToCompleted = completedResult.count;

      if (transitionedToOngoing > 0 || transitionedToCompleted > 0) {
        logger.info(
          `[TournamentLifecycleTask] Transitioned ${transitionedToOngoing} tournaments to ONGOING, ${transitionedToCompleted} to COMPLETED`
        );
        await bumpSyncTimestamp('tournament');
      }
    } catch (err: unknown) {
      const msg = `Failed to advance tournament lifecycle: ${err instanceof Error ? err.message : String(err)}`;
      logger.error(msg, err);
      errors.push(msg);
    }

    const totalProcessed = transitionedToOngoing + transitionedToCompleted;

    return {
      success: errors.length === 0,
      taskId: this.id,
      durationMs: 0,
      processedCount: totalProcessed,
      details: {
        transitionedToOngoing,
        transitionedToCompleted,
        closedRegistrationsCount,
        errors,
      },
      errors: errors.length > 0 ? errors : undefined,
      executedAt: new Date(),
    };
  }
}

export const tournamentLifecycleTask = new TournamentLifecycleTask();
