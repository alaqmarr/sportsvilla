import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import jwt from 'jsonwebtoken';
import { jsonResponse } from '@/lib/api-logger';

export async function POST(request: Request) {
  console.log(`[API] POST /api/client/v1/tournaments/register called`);
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
    
    const { tournamentId, teamName, paymentScreenshotUrl, paymentUtr, players, aiVerified, paymentMethod } = await request.json();

    if (!tournamentId) {
      return jsonResponse({ error: "tournamentId is required" }, { status: 400 });
    }

    // Verify tournament exists and is upcoming
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return jsonResponse({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.status !== 'UPCOMING') {
      return jsonResponse({ error: "Registration is closed for this tournament" }, { status: 400 });
    }

    // Create Registration and Players within a transaction to enforce maxTeams limit and avoid race conditions
    const registration = await prisma.$transaction(async (tx) => {
      // Re-fetch tournament to ensure latest maxTeams data
      const currentTournament = await tx.tournament.findUnique({ where: { id: tournamentId } });
      if (!currentTournament) throw new Error("Tournament not found");

      if (paymentUtr && paymentUtr !== 'MANUAL_CASH') {
        const existing = await tx.tournamentRegistration.findFirst({
          where: {
            tournamentId,
            paymentUtr,
            status: { not: 'REJECTED' }
          }
        });
        
        if (existing) {
          throw new Error("This Transaction ID (UTR) has already been used for this tournament. Please contact support if you think this is a mistake.");
        }
      }

      if (currentTournament.maxTeams) {
        const currentRegistrations = await tx.tournamentRegistration.count({
          where: {
            tournamentId,
            status: { not: 'REJECTED' }
          }
        });
        if (currentRegistrations >= currentTournament.maxTeams) {
          throw new Error("Tournament is full");
        }
      }

      return await tx.tournamentRegistration.create({
        data: {
          tournamentId,
          registeredById: memberId,
          teamName,
          paymentScreenshotUrl,
          paymentUtr,
          paymentMethod: paymentMethod || 'UPI',
          status: (paymentMethod === 'CASH') ? 'PENDING' : (aiVerified ? 'VERIFIED' : 'PENDING'),
          players: {
            create: players.map((p: any) => ({
              name: p.name,
              mobile: p.mobile
            }))
          }
        },
        include: {
          players: true
        }
      });
    });

    return jsonResponse({ success: true, registration });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/tournaments/register ->`, error);
    logger.error('Failed to register for tournament', { error: error.message });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
