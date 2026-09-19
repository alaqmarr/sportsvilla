import { jsonResponse, apiLog } from '@/core/logging/api-logger';
import { clearSessionCookie } from '@/core/auth/web-auth';

export async function POST() {
  apiLog(`[API] POST /api/client/v1/auth/web/logout called`);
  const response = jsonResponse({ success: true });
  return clearSessionCookie(response);
}
