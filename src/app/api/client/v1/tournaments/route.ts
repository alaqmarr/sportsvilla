import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { jsonResponse } from '@/lib/api-logger';

export async function GET(request: Request) {
  logger.debug(`[API] GET /api/client/v1/tournaments called`);
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'UPCOMING';
    const sportId = url.searchParams.get('sportId');
    
    const whereClause: any = {
      status,
      isPublic: true
    };

    if (sportId) {
      whereClause.sportId = sportId;
    }

    const tournaments = await prisma.tournament.findMany({
      where: whereClause,
      orderBy: {
        startDate: 'asc'
      },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    return jsonResponse({ success: true, tournaments });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/tournaments ->`, error);
    logger.error('Failed to fetch tournaments', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
