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
        sport: true
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
