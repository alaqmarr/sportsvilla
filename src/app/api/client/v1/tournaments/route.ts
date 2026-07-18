import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
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

    return NextResponse.json({ success: true, tournaments });
  } catch (error: any) {
    logger.error('Failed to fetch tournaments', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
