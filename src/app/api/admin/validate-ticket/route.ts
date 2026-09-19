import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/core/auth/rbac-definitions";
import { requireApiPermission } from "@/core/auth/serverRbac";
import { prisma } from "@/core/database/prisma";
import { formatIST, getISTDateBounds } from "@/core/utils/dateUtils";
import { NfcCheckinService } from "@/modules/nfc/nfc-checkin.services";

export async function POST(req: NextRequest) {
  try {
    // 1. RBAC authorization: check manage:bookings or manage:checkin
    let { error, admin } = await requireApiPermission(PERMISSIONS.MANAGE_BOOKINGS);
    if (error) {
      const checkinCheck = await requireApiPermission("manage:checkin");
      if (!checkinCheck.error) {
        error = null;
        admin = checkinCheck.admin;
      }
    }
    if (error) return error;

    // 2. Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, valid: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { payload, type, turfId } = body || {};
    if (!payload || typeof payload !== "string" || !payload.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "Missing or invalid payload" },
        { status: 400 }
      );
    }

    const trimmedPayload = payload.trim();

    // 3. Extract identifier
    let ticketId = trimmedPayload;

    // Attempt JSON parse if wrapped in braces
    if (trimmedPayload.startsWith("{") && trimmedPayload.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmedPayload);
        ticketId = parsed.id || parsed.ticketId || parsed.qrCode || parsed.code || trimmedPayload;
      } catch {
        ticketId = trimmedPayload;
      }
    }

    // 4. Handle NFC card UID check-in
    const isExplicitNfc = type === "NFC";
    const isPotentialNfcUid =
      !ticketId.startsWith("TICKET-") &&
      !ticketId.startsWith("c") &&
      /^[0-9a-fA-F]{8,16}$/.test(ticketId);

    if (isExplicitNfc || isPotentialNfcUid) {
      const normalizedUid = NfcCheckinService.normalizeCardUid(ticketId);
      const card = await prisma.nfcCard.findUnique({
        where: { cardUid: normalizedUid },
      });

      if (card || isExplicitNfc) {
        const nfcResult = await NfcCheckinService.resolveCheckin({
          cardUid: normalizedUid,
          deviceType: "POS_READER",
          location: "ADMIN_SCANNER",
        });

        if (!nfcResult.success) {
          return NextResponse.json(
            {
              success: false,
              valid: false,
              error: nfcResult.message || nfcResult.error || "NFC check-in failed",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          valid: true,
          booking: {
            id: nfcResult.details?.bookingId || nfcResult.details?.attendanceId || "nfc-checkin",
            ticketId: nfcResult.details?.ticketId || card?.cardUid || "nfc-pass",
            customerName: nfcResult.member?.name || "Member",
            customerPhone: nfcResult.member?.mobile || "",
            sport:
              nfcResult.details?.sportName ||
              nfcResult.details?.membershipPlanName ||
              "SportsVilla",
            turf: nfcResult.details?.courtName || "Sports Facility",
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            status: "CHECKED_IN",
            action: nfcResult.action,
          },
          message: nfcResult.message || "NFC check-in verified successfully",
        });
      }
    }

    // 5. Query Ticket via Prisma (by ticket ID or QR code)
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id: ticketId }, { qrCode: ticketId }],
      },
      include: {
        booking: {
          include: {
            turf: true,
            sport: true,
            member: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: "Invalid ticket: No matching booking found.",
        },
        { status: 404 }
      );
    }

    const booking = ticket.booking;

    // Check optional turfId match if provided
    if (turfId && booking.turfId !== turfId) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Ticket is for a different turf (${booking.turf.name}).`,
        },
        { status: 400 }
      );
    }

    // Check if already checked in
    if (ticket.status === "CHECKED_IN") {
      const formattedUsedAt = ticket.usedAt
        ? formatIST(ticket.usedAt, "dd MMM yyyy, h:mm a")
        : "earlier";
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Ticket already checked in at ${formattedUsedAt}`,
          booking: {
            id: booking.id,
            ticketId: ticket.id,
            customerName: booking.member.name,
            customerPhone: booking.member.mobile,
            sport: booking.sport.name,
            turf: booking.turf.name,
            startTime: booking.startTime.toISOString(),
            endTime: booking.endTime.toISOString(),
            status: "CHECKED_IN",
            paymentStatus: booking.paymentStatus,
          },
        },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (ticket.status === "CANCELLED" || booking.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: "Ticket is cancelled",
        },
        { status: 400 }
      );
    }

    // Check validity dates and time window
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const bookingDateStr = formatIST(booking.startTime, "yyyy-MM-dd");
    const { start: bookingDayStart, end: bookingDayEnd } = getISTDateBounds(bookingDateStr);

    const validityEnd = new Date(bookingDayEnd.getTime());
    if (booking.turf.bookingValidityDays > 0) {
      validityEnd.setDate(validityEnd.getDate() + booking.turf.bookingValidityDays);
    }

    // Allow check-in up to 2 hours (120 mins) before start time
    const earlyAllowTime = new Date(startTime.getTime() - 120 * 60 * 1000);

    if (now < earlyAllowTime) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Too early to check-in. Booking starts at ${formatIST(startTime, "h:mm a")}`,
        },
        { status: 400 }
      );
    }

    if (now > validityEnd) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: `Ticket has expired. Booking was scheduled for ${formatIST(startTime, "dd MMM yyyy")}`,
        },
        { status: 400 }
      );
    }

    // 6. Perform atomic transaction
    const sport = booking.sport;
    try {
      await prisma.$transaction(async (tx) => {
        // Re-fetch ticket inside transaction to prevent double check-in race conditions
        const freshTicket = await tx.ticket.findUnique({
          where: { id: ticket.id },
        });

        if (!freshTicket || freshTicket.status !== "VALID") {
          throw new Error("TICKET_ALREADY_USED");
        }

        // Update ticket status
        await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: "CHECKED_IN",
            usedAt: now,
          },
        });

        // Award loyalty points if sport has rewardPointsPerCheckin configured
        if (sport && sport.rewardPointsPerCheckin > 0) {
          await tx.member.update({
            where: { id: booking.memberId },
            data: {
              loyaltyPoints: { increment: sport.rewardPointsPerCheckin },
            },
          });

          await tx.loyaltyHistory.create({
            data: {
              memberId: booking.memberId,
              points: sport.rewardPointsPerCheckin,
              type: "EARNED",
              source: "CHECKIN",
              description: `Earned for ticket check-in: ${sport.name}`,
            },
          });
        }
      });
    } catch (err: any) {
      if (err.message === "TICKET_ALREADY_USED") {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            error: `Ticket already checked in`,
            booking: {
              id: booking.id,
              ticketId: ticket.id,
              customerName: booking.member.name,
              customerPhone: booking.member.mobile,
              sport: booking.sport.name,
              turf: booking.turf.name,
              startTime: booking.startTime.toISOString(),
              endTime: booking.endTime.toISOString(),
              status: "CHECKED_IN",
            },
          },
          { status: 400 }
        );
      }
      throw err;
    }

    // 7. Non-blocking WhatsApp check-in template notification
    if (booking.member?.mobile) {
      try {
        const { sendWhatsAppCheckinTemplate } = require("@/modules/whatsapp/checkin.template");
        const formattedTime = formatIST(now, "h:mm a");
        sendWhatsAppCheckinTemplate(
          booking.member.name,
          sport?.name || "Sportsvilla",
          formattedTime,
          booking.member.mobile
        ).catch(console.error);
      } catch (e) {
        console.error("WhatsApp check-in notification dispatch error:", e);
      }
    }

    // 8. Return success response
    return NextResponse.json({
      success: true,
      valid: true,
      booking: {
        id: booking.id,
        ticketId: ticket.id,
        customerName: booking.member.name,
        customerPhone: booking.member.mobile,
        sport: booking.sport.name,
        turf: booking.turf.name,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        status: "CHECKED_IN",
        paymentStatus: booking.paymentStatus,
      },
      message: "Check-in successful",
    });
  } catch (error: any) {
    console.error(`[API ERROR] POST /api/admin/validate-ticket ->`, error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
      },
      { status: 500 }
    );
  }
}
