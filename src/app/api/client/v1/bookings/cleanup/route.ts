import { runner } from '@/automations';
import { BookingCleanupDetails } from '@/automations/tasks/booking-cleanup.task';
import { jsonResponse } from '@/core/logging/api-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/auth';

async function isAuthorized(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && token === cronSecret) {
      return true;
    }
  }

  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return true;
    }
  } catch {
    // Ignore session errors
  }

  return false;
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let timeoutMinutes = 15;
    try {
      const body = await request.json();
      if (body?.timeoutMinutes && typeof body.timeoutMinutes === 'number') {
        timeoutMinutes = body.timeoutMinutes;
      }
    } catch {
      // Body is optional, default to 15m
    }

    const result = await runner.runTask('booking-cleanup', { timeoutMinutes });
    const details = result.details as BookingCleanupDetails | undefined;

    return jsonResponse({
      success: result.success,
      cleaned: details?.expiredCount ?? result.processedCount,
      refunded: details?.refundedCount ?? 0,
      totalRefundPaise: details?.totalRefundPaise ?? 0,
      errors: details?.errors ?? result.errors ?? [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cleanup execution failed';
    return jsonResponse(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Support GET for scheduled maintenance cron or health check
export async function GET(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runner.runTask('booking-cleanup', { timeoutMinutes: 15 });
    const details = result.details as BookingCleanupDetails | undefined;

    return jsonResponse({
      success: result.success,
      cleaned: details?.expiredCount ?? result.processedCount,
      refunded: details?.refundedCount ?? 0,
      totalRefundPaise: details?.totalRefundPaise ?? 0,
      errors: details?.errors ?? result.errors ?? [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cleanup execution failed';
    return jsonResponse(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
