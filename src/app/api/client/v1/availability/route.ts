import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { jsonResponse, apiLog } from '@/core/logging/api-logger';
import { formatIST } from '@/core/utils/dateUtils';
import { AvailabilityService } from '@/modules/bookings/bookings.services';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/availability called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  const sportId = searchParams.get('sportId');

  if (!dateStr || !sportId) {
    return jsonResponse({ error: 'date and sportId are required' }, { status: 400 });
  }

  try {
    const result = await AvailabilityService.getAvailability(dateStr, sportId);
    return jsonResponse({ success: true, turfs: result });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/availability ->`, error);
    console.error('Availability fetch error:', error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
