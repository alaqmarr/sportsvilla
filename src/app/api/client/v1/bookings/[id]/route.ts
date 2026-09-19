import { NextResponse } from 'next/server';
import { prisma } from '@/core/database/prisma';
import { authenticateClient } from '@/core/auth/auth-middleware';
import { jsonResponse, apiLog } from '@/core/logging/api-logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/core/auth/auth';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] GET /api/client/v1/bookings/[id] called`);

  // 1. Check for active Admin session
  const adminSession = await getServerSession(authOptions);
  const isAdmin = !!adminSession?.user?.email;

  // 2. If not admin, authenticate client
  let member: any = null;
  if (!isAdmin) {
    const authRes = await authenticateClient(request);
    if ('error' in authRes) return authRes.error;
    member = authRes.member;
  }
  
  const params = await context.params;

  apiLog("[GET /bookings/[id]] Hit", { bookingId: params.id, memberId: member?.id, isAdmin });

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        tickets: true,
        turf: true,
        sport: true,
        member: true,
        payments: true,
        participants: {
          include: { member: true }
        }
      }
    });

    if (!booking) {
      apiLog("[GET /bookings/[id]] Booking not found in DB for ID:", params.id);
      return jsonResponse({ error: "Booking not found" }, { status: 404 });
    }

    // IDOR Protection: Verify ownership (direct owner, family group, or game participant)
    if (!isAdmin && member) {
      const isDirectOwner = booking.memberId === member.id;
      const isFamilyMember =
        (member.familyId && booking.member?.familyId === member.familyId) ||
        (member.mobile && booking.member?.mobile === member.mobile);
      const isParticipant = booking.participants?.some(p => p.memberId === member.id);

      if (!isDirectOwner && !isFamilyMember && !isParticipant) {
        return jsonResponse(
          { error: "Forbidden: You do not have permission to view this booking" },
          { status: 403 }
        );
      }
    }
    
    apiLog("[GET /bookings/[id]] Found booking:", booking.id);

    const allCheckedIn = booking.tickets && booking.tickets.length > 0 && booking.tickets.every((t: any) => t.usedAt);
    const anyCheckedIn = booking.tickets && booking.tickets.some((t: any) => t.usedAt);

    return jsonResponse({ 
      success: true, 
      checkedIn: allCheckedIn,
      anyCheckedIn,
      tickets: booking.tickets,
      booking
    });
  } catch (error: any) {
    console.error(`[API ERROR] GET /api/client/v1/bookings/[id] ->`, error);
    console.error("[GET /bookings/[id]] Prisma/Internal error:", error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] PATCH /api/client/v1/bookings/[id] called`);

  const adminSession = await getServerSession(authOptions);
  const isAdmin = !!adminSession?.user?.email;

  let member: any = null;
  if (!isAdmin) {
    const authRes = await authenticateClient(request);
    if ('error' in authRes) return authRes.error;
    member = authRes.member;
  }
  
  const params = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const { visibility, inviteMaxCount } = body;

    const existing = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { member: true }
    });

    if (!existing) {
      return jsonResponse({ error: "Booking not found" }, { status: 404 });
    }

    if (!isAdmin && member) {
      const familyMembers = await prisma.member.findMany({
        where: { mobile: member.mobile },
        select: { id: true }
      });
      const familyIds = familyMembers.map(m => m.id);
      const isOwnerOrFamily =
        familyIds.includes(existing.memberId) ||
        (member.familyId && existing.member?.familyId === member.familyId);

      if (!isOwnerOrFamily) {
        return jsonResponse({ error: "Forbidden: Only the host can modify this game" }, { status: 403 });
      }
    }

    let inviteCode = existing.inviteCode;
    if ((visibility === 'OPEN' || visibility === 'INVITE_ONLY') && !inviteCode) {
      inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(visibility ? { visibility } : {}),
        ...(inviteMaxCount !== undefined ? { inviteMaxCount: Number(inviteMaxCount) } : {}),
        ...(inviteCode ? { inviteCode } : {})
      },
      include: {
        turf: true,
        sport: true,
        member: true,
        participants: { include: { member: true } }
      }
    });

    return jsonResponse({ success: true, booking: updated });
  } catch (error: any) {
    console.error(`[API ERROR] PATCH /api/client/v1/bookings/[id] ->`, error);
    return jsonResponse({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message }, { status: 500 });
  }
}

