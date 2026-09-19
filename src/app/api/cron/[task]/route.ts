import { runner, registry } from '@/automations';
import { jsonResponse } from '@/core/logging/api-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/auth';

/**
 * Validates request authorization via Bearer CRON_SECRET or an authenticated Admin Session.
 */
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
    // Suppress session error
  }

  return false;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ task: string }> }
) {
  try {
    if (!(await isAuthorized(request))) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { task: taskSlug } = await context.params;

    let options: Record<string, any> = {};
    try {
      options = await request.json();
    } catch {
      // Body is optional
    }

    // Special wildcard 'all' executes all registered tasks
    if (taskSlug === 'all') {
      const results = await runner.runAllTasks(options);
      return jsonResponse({
        success: results.every((r) => r.success),
        totalTasks: results.length,
        results,
      });
    }

    if (!registry.hasTask(taskSlug)) {
      return jsonResponse(
        {
          success: false,
          error: `Automation task '${taskSlug}' not found in registry`,
          availableTasks: registry.getAllTasks().map((t) => t.id),
        },
        { status: 404 }
      );
    }

    const result = await runner.runTask(taskSlug, options);
    return jsonResponse(result, { status: result.success ? 200 : 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal cron execution error';
    return jsonResponse({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ task: string }> }
) {
  try {
    if (!(await isAuthorized(request))) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { task: taskSlug } = await context.params;

    const url = new URL(request.url);
    const options: Record<string, any> = {};
    url.searchParams.forEach((val, key) => {
      options[key] = isNaN(Number(val)) ? val : Number(val);
    });

    if (taskSlug === 'all') {
      const results = await runner.runAllTasks(options);
      return jsonResponse({
        success: results.every((r) => r.success),
        totalTasks: results.length,
        results,
      });
    }

    if (!registry.hasTask(taskSlug)) {
      return jsonResponse(
        {
          success: false,
          error: `Automation task '${taskSlug}' not found in registry`,
          availableTasks: registry.getAllTasks().map((t) => t.id),
        },
        { status: 404 }
      );
    }

    const result = await runner.runTask(taskSlug, options);
    return jsonResponse(result, { status: result.success ? 200 : 500 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal cron execution error';
    return jsonResponse({ success: false, error: message }, { status: 500 });
  }
}
