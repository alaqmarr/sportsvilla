import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import jwt from 'jsonwebtoken';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request) {
  apiLog(`[API] GET /api/client/v1/tournaments/my-registrations called`);
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev') as any;
    
    if (!decoded.memberId) {
      return jsonResponse({ error: "Invalid token" }, { status: 401 });
    }

    const memberId = decoded.memberId;
    
    const registrations = await prisma.tournamentRegistration.findMany({
      where: {
        registeredById: memberId
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
            startDate: true,
            isPublic: true
          }
        },
        players: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return jsonResponse({ success: true, registrations });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/tournaments/my-registrations ->`, error);
    logger.error('Failed to fetch my registrations', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
