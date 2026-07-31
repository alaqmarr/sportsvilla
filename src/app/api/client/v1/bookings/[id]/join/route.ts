import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { sendWhatsAppPlayerJoinedNotification } from '@/lib/whatsapp';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] POST /api/client/v1/bookings/[id]/join called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member } = authRes;
  const params = await context.params;
  const bookingId = params.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        participants: true,
        turf: true,
      },
    });

    if (!booking) {
      return jsonResponse({ error: 'Game not found' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED') {
      return jsonResponse({ error: 'This game has been cancelled.' }, { status: 400 });
    }

    if (new Date(booking.startTime) < new Date()) {
      return jsonResponse({ error: 'Cannot join a game in the past.' }, { status: 400 });
    }

    const alreadyJoined = booking.participants.some((p) => p.memberId === member.id);
    if (alreadyJoined) {
      return jsonResponse({ error: 'You have already joined this game.' }, { status: 400 });
    }

    if (booking.inviteMaxCount && booking.participantCount >= booking.inviteMaxCount) {
      return jsonResponse({ error: 'Game is full. Maximum player limit reached.' }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookingParticipant.create({
        data: {
          bookingId: booking.id,
          memberId: member.id,
          status: 'CONFIRMED',
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          participantCount: {
            increment: 1,
          },
        },
      });
    });

    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        turf: true,
        sport: true,
        member: { select: { id: true, name: true, mobile: true } },
        participants: {
          include: {
            member: { select: { id: true, name: true, mobile: true } },
          },
        },
      },
    });

    // Notify host via WhatsApp when someone joins their game
    if (updatedBooking && updatedBooking.member && updatedBooking.memberId !== member.id) {
      const hostPhone = updatedBooking.member.mobile || (updatedBooking.member as any).phone;
      if (hostPhone) {
        const hostName = updatedBooking.member.name || "Host";
        const playerName = member.name || "A Player";
        const sportName = updatedBooking.sport?.name || "Sports";
        const courtName = updatedBooking.turf?.name || "SportsVilla Court";
        const dateStr = new Date(updatedBooking.startTime).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        });
        const spotsLeft = Math.max(0, (updatedBooking.inviteMaxCount || 4) - updatedBooking.participantCount);

        // Run non-blocking so API returns fast
        sendWhatsAppPlayerJoinedNotification(
          hostPhone,
          hostName,
          playerName,
          sportName,
          courtName,
          dateStr,
          spotsLeft
        ).catch(e => console.error("Failed to notify host via WhatsApp:", e));
      }
    }

    return jsonResponse({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/client/v1/bookings/[id]/join ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] DELETE /api/client/v1/bookings/[id]/join called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;

  const { member } = authRes;
  const params = await context.params;
  const bookingId = params.id;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { participants: true },
    });

    if (!booking) {
      return jsonResponse({ error: 'Game not found' }, { status: 404 });
    }

    if (booking.memberId === member.id) {
      return jsonResponse({ error: 'Host cannot leave their own game. Please cancel the booking instead.' }, { status: 400 });
    }

    const participant = booking.participants.find((p) => p.memberId === member.id);
    if (!participant) {
      return jsonResponse({ error: 'You are not a participant in this game.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.bookingParticipant.deleteMany({
        where: {
          bookingId: booking.id,
          memberId: member.id,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: {
          participantCount: {
            decrement: 1,
          },
        },
      });
    });

    return jsonResponse({
      success: true,
      message: 'Successfully left the game',
    });
  } catch (error: any) {
    console.error(`[API ERROR] DELETE /api/client/v1/bookings/[id]/join ->`, error);
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}
