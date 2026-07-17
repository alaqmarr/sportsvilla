import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: { id: true }
    });
    const familyIds = familyMembers.map(m => m.id);

    const bookings = await prisma.booking.findMany({
      where: { memberId: { in: familyIds } },
      include: {
        turf: true,
        sport: true,
        tickets: true,
        member: { select: { name: true, id: true } }
      },
      orderBy: { startTime: 'desc' }
    });
    
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;

  try {
    const body = await request.json();
    const { turfId, sportId, startTime, endTime, price, participantCount } = body;

    // TODO: Ideally we should use a transaction here, but for now simple create.
    // In WAL mode, SQLite will handle concurrent writes sequentially.
    const booking = await prisma.booking.create({
      data: {
        turfId,
        sportId,
        memberId: member.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        price,
        participantCount,
        status: "CONFIRMED",
        paymentStatus: "PENDING"
      }
    });

    // Generate Tickets
    const tickets = [];
    for(let i = 0; i < participantCount; i++) {
      tickets.push({
        bookingId: booking.id,
        qrCode: `TICKET-${booking.id}-${i}-${Date.now()}`
      });
    }

    await prisma.ticket.createMany({ data: tickets });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
