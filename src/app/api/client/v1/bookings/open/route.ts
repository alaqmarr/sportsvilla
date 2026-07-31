import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/bookings/open called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  try {
    const openGames = await prisma.booking.findMany({
      where: {
        visibility: 'OPEN',
        status: 'CONFIRMED',
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        turf: true,
        sport: true,
        member: {
          select: { id: true, name: true, mobile: true },
        },
        participants: {
          include: {
            member: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return jsonResponse({
      success: true,
      openGames,
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/bookings/open ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
