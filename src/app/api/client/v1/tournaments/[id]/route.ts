import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import jwt from 'jsonwebtoken';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  apiLog(`[API] GET /api/client/v1/tournaments/[id] called`);
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: (await params).id },
      include: {
        sport: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!tournament) {
      return jsonResponse(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    const upiSetting = await prisma.setting.findUnique({
      where: { key: 'UPI_ID' }
    });
    const upiId = upiSetting?.value || 'sportsvilla@upi';

    let existingRegistration = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev') as any;
        if (decoded.memberId) {
          existingRegistration = await prisma.tournamentRegistration.findFirst({
            where: {
              tournamentId: tournament.id,
              registeredById: decoded.memberId,
              status: { not: 'REJECTED' }
            },
            include: { players: true }
          });
        }
      } catch (err) {
    console.error(`[API ERROR] GET /api/client/v1/tournaments/[id] ->`, err);
        // ignore invalid token, just return tournament details
      }
    }

    return jsonResponse({ success: true, tournament, upiId, existingRegistration });
  } catch (error: any) {
    logger.error("Failed to fetch tournament details", {
      error: error.message,
    });
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
