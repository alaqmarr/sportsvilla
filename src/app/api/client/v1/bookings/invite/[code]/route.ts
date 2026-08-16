import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  apiLog(`[API] GET /api/client/v1/bookings/invite/[code] called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const params = await context.params;
  const code = params.code?.toUpperCase();

  try {
    const booking = await prisma.booking.findUnique({
      where: { inviteCode: code },
      include: {
        turf: true,
        sport: true,
        member: { select: { id: true, name: true, mobile: true } },
        participants: {
          include: {
            member: { select: { id: true, name: true, mobile: true } },
          },
        },
      },
    });

    if (!booking) {
      return jsonResponse({ error: 'Invite link is invalid or game not found.' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED') {
      return jsonResponse({ error: 'This game has been cancelled.' }, { status: 400 });
    }

    return jsonResponse({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/bookings/invite/[code] ->`, error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
