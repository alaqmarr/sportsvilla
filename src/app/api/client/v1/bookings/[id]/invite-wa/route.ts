import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateClient } from '@/lib/auth-middleware';
import { jsonResponse, apiLog } from '@/lib/api-logger';
import { sendWhatsAppGameInviteTemplate } from '@/lib/whatsapp';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  apiLog(`[API] POST /api/client/v1/bookings/[id]/invite-wa called`);
  const authRes = await authenticateClient(request);
  if ('error' in authRes) return authRes.error;
  
  const { member } = authRes;
  const params = await context.params;

  try {
    const body = await request.json().catch(() => ({}));
    const { phone, name } = body;

    if (!phone || typeof phone !== 'string') {
      return jsonResponse({ success: false, error: "Valid phone number is required" }, { status: 400 });
    }

    let booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { turf: true, member: true, sport: true }
    });

    if (!booking) {
      return jsonResponse({ success: false, error: "Booking not found" }, { status: 404 });
    }

    // Ensure caller is authorized (host or same family mobile)
    const familyMembers = await prisma.member.findMany({
      where: { mobile: member.mobile },
      select: { id: true }
    });
    const familyIds = familyMembers.map(m => m.id);
    if (!familyIds.includes(booking.memberId)) {
      return jsonResponse({ success: false, error: "Only the host can send WhatsApp invitations" }, { status: 403 });
    }

    if (booking.status === "CANCELLED") {
      return jsonResponse({ success: false, error: "Cannot invite players to a cancelled booking" }, { status: 400 });
    }

    // Generate invite code if not already set
    let inviteCode = booking.inviteCode;
    if (!inviteCode) {
      inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      booking = await prisma.booking.update({
        where: { id: booking.id },
        data: { inviteCode },
        include: { turf: true, member: true, sport: true }
      });
    }

    const hostName = booking.member?.name || "A SportsVilla Player";
    const sportName = booking.sport?.name || "Sports";
    const courtName = booking.turf?.name || "SportsVilla Court";
    const dateStr = new Date(booking.startTime).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
    const inviteLink = `https://sportsvilla.in/join/${inviteCode}`;

    // Send WhatsApp invitation asynchronously / non-blocking
    const waRes = await sendWhatsAppGameInviteTemplate(
      phone,
      hostName,
      sportName,
      courtName,
      dateStr,
      inviteLink,
      name
    );

    return jsonResponse({
      success: true,
      inviteCode,
      inviteLink,
      sentTo: phone,
      whatsappResult: waRes
    });
  } catch (err: any) {
    console.error("Error in POST /bookings/[id]/invite-wa:", err);
    return jsonResponse({ success: false, error: err.message || "Failed to send WhatsApp invitation" }, { status: 500 });
  }
}
