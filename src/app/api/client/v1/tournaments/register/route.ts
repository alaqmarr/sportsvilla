import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev') as any;
    
    if (!decoded.memberId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const memberId = decoded.memberId;
    
    const { tournamentId, teamName, paymentScreenshotUrl, paymentUtr, players, aiVerified, paymentMethod } = await request.json();

    if (!tournamentId) {
      return NextResponse.json({ error: "tournamentId is required" }, { status: 400 });
    }

    // Verify tournament exists and is upcoming
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId }
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.status !== 'UPCOMING') {
      return NextResponse.json({ error: "Registration is closed for this tournament" }, { status: 400 });
    }

    if (paymentUtr && paymentUtr !== 'MANUAL_CASH') {
      const existing = await prisma.tournamentRegistration.findFirst({
        where: {
          tournamentId,
          paymentUtr,
          status: { not: 'REJECTED' }
        }
      });
      
      if (existing) {
        return NextResponse.json({ error: "This Transaction ID (UTR) has already been used for this tournament. Please contact support if you think this is a mistake." }, { status: 400 });
      }
    }

    // Create Registration and Players
    const registration = await prisma.tournamentRegistration.create({
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

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    logger.error('Failed to register for tournament', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
