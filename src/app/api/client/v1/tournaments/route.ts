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
      isPublic: true
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    // Hide expired upcoming tournaments (where start date is in the past)
    if (status === 'UPCOMING') {
      whereClause.startDate = {
        gte: new Date(new Date().setHours(0, 0, 0, 0))
      };
    }

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
    logger.error('Failed to fetch tournaments', { error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}
