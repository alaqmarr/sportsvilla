import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  console.log("[GET /bookings/[id]] Hit with id:", params.id, "from member:", member.id);

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
      console.log("[GET /bookings/[id]] Booking not found in DB for ID:", params.id);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    
    console.log("[GET /bookings/[id]] Found booking:", booking.id);

    const allCheckedIn = booking.tickets && booking.tickets.length > 0 && booking.tickets.every((t: any) => t.usedAt);
    const anyCheckedIn = booking.tickets && booking.tickets.some((t: any) => t.usedAt);

    return NextResponse.json({ 
      success: true, 
      checkedIn: allCheckedIn,
      anyCheckedIn,
      tickets: booking.tickets,
      booking
    });
  } catch (error: any) {
    console.error("[GET /bookings/[id]] Prisma/Internal error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
