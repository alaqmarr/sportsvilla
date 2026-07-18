import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        tickets: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const allCheckedIn = booking.tickets && booking.tickets.length > 0 && booking.tickets.every((t: any) => t.usedAt);
    const anyCheckedIn = booking.tickets && booking.tickets.some((t: any) => t.usedAt);

    return NextResponse.json({ 
      success: true, 
      checkedIn: allCheckedIn,
      anyCheckedIn,
      tickets: booking.tickets 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
