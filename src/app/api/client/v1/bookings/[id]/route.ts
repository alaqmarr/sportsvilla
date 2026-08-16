import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] GET /api/client/v1/bookings/[id] called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  apiLog("[GET /bookings/[id]] Hit", { bookingId: params.id, memberId: member.id });

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
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] PATCH /api/client/v1/bookings/[id] called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const { visibility, inviteMaxCount } = body;

    const existing = await prisma.booking.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return jsonResponse({ error: "Booking not found" }, { status: 404 });
    }

    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: { id: true }
    });
    const familyIds = familyMembers.map(m => m.id);
    if (!familyIds.includes(existing.memberId)) {
      return jsonResponse({ error: "Only the host can modify this game" }, { status: 403 });
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
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
