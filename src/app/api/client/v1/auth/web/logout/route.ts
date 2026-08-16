import { jsonResponse, apiLog } from '@/lib/api-logger';
import { clearSessionCookie } from '@/lib/web-auth';

export async function POST() {
  apiLog(`[API] POST /api/client/v1/auth/web/logout called`);
  const response = jsonResponse({ success: true });
  return clearSessionCookie(response);
}
