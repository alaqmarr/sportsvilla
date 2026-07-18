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

    // STRICT AVAILABILITY CHECK
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // 1. Get turf capacity
    const turf = await prisma.turf.findUnique({ where: { id: turfId } });
    if (!turf) {
      return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    // 2. Count overlapping bookings for this exact slot
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        turfId,
        status: { not: 'CANCELLED' },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    const usedCapacity = overlappingBookings.reduce((sum, b) => sum + b.participantCount, 0);
    const availableCourts = turf.capacityPerSlot - usedCapacity;

    if (participantCount > availableCourts) {
      return NextResponse.json({ 
        error: 'Slot is no longer available or insufficient courts.' 
      }, { status: 409 });
    }

    // Calculate SV Points Earned (e.g. 1% of total price as points)
    const pointsEarned = Math.floor(price * 0.01);

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        turfId,
        sportId,
        memberId: member.id,
        startTime: start,
        endTime: end,
        price,
        participantCount,
        status: "CONFIRMED",
        paymentStatus: "PENDING"
      }
    });

    // Add points to Member
    if (pointsEarned > 0) {
      await prisma.member.update({
        where: { id: member.id },
        data: { loyaltyPoints: { increment: pointsEarned } }
      });
      // Add History
      await prisma.loyaltyHistory.create({
        data: {
          memberId: member.id,
          points: pointsEarned,
          type: 'EARNED',
          source: 'BOOKING',
          description: `Earned from booking ${booking.id}`
        }
      });
    }

    // Generate Tickets
    const tickets = [];
    for(let i = 0; i < participantCount; i++) {
      tickets.push({
        bookingId: booking.id,
        qrCode: `TICKET-${booking.id}-${i}-${Date.now()}`,
        guestName: body.guests && body.guests[i] ? body.guests[i].name : null
      });
    }

    await prisma.ticket.createMany({ data: tickets });

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
