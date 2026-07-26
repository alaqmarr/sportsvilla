"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { formatIST, getISTDateBounds } from "@/lib/dateUtils";

export async function fetchSportsForCheckin() {
  return await prisma.sport.findMany();
}

export async function lookupTicket(query: string) {
  // Query could be a QR code or a Mobile number
  let tickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { qrCode: query },
        { booking: { member: { mobile: query } } }
      ],
      status: { not: "CANCELLED" }
    },
    include: {
      booking: {
        include: {
          member: true,
          sport: true,
          turf: true
        }
      }
    }
  });

  return tickets;
}

export async function confirmTicketCheckin(ticketIdOrQrCode: string, deskSportId: string) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { id: ticketIdOrQrCode },
        { qrCode: ticketIdOrQrCode }
      ]
    },
    include: { booking: { include: { turf: true } } }
  });

  if (!ticket) return { error: "Ticket not found." };
  if (ticket.status !== "VALID") return { error: `Ticket is already ${ticket.status}.` };
  if (ticket.booking.sportId !== deskSportId) return { error: "Ticket is not for the selected sport." };

  // Check validity dates
  const now = new Date();
  const startTime = new Date(ticket.booking.startTime);
  
  // Use getISTDateBounds to get the start of the booking day in IST,
  // then figure out the validity end time from there.
  const bookingDateStr = formatIST(ticket.booking.startTime, 'yyyy-MM-dd');
  const { start: bookingDayStart, end: bookingDayEnd } = getISTDateBounds(bookingDateStr);
  
  const validityEnd = new Date(bookingDayEnd.getTime());
  
  if (ticket.booking.turf.bookingValidityDays > 0) {
    validityEnd.setDate(validityEnd.getDate() + ticket.booking.turf.bookingValidityDays);
  }

  // Allow check-in a bit early (e.g. 1 hour before start time)
  const earlyAllowTime = new Date(startTime.getTime() - 60 * 60000);

  if (now < earlyAllowTime) {
    return { error: "Too early to check-in. Booking starts at " + formatIST(startTime, 'h:mm a') };
  }

  if (now > validityEnd) {
    return { error: "Ticket has expired." };
  }

  // Process checkin
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: "CHECKED_IN",
      usedAt: new Date()
    }
  });

  const sport = await prisma.sport.findUnique({ where: { id: ticket.booking.sportId } });
  if (sport && sport.rewardPointsPerCheckin > 0) {
    await prisma.member.update({
      where: { id: ticket.booking.memberId },
      data: { loyaltyPoints: { increment: sport.rewardPointsPerCheckin } }
    });
    await prisma.loyaltyHistory.create({
      data: {
        memberId: ticket.booking.memberId,
        points: sport.rewardPointsPerCheckin,
        type: "EARNED",
        source: "CHECKIN",
        description: `Earned for checking into booking: ${sport.name}`
      }
    });
  }

  revalidatePath("/", "layout");
  return { success: true };
}
