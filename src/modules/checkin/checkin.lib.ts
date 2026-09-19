import { prisma } from "@/core/database/prisma";
import { validateTicketTiming } from "./checkin.helper";

export async function fetchSportsForCheckinCore() {
  return await prisma.sport.findMany();
}

export async function lookupTicketCore(query: string) {
  return await prisma.ticket.findMany({
    where: {
      OR: [
        { qrCode: query },
        { booking: { member: { mobile: query } } },
      ],
      status: { not: "CANCELLED" },
    },
    include: {
      booking: {
        include: {
          member: true,
          sport: true,
          turf: true,
        },
      },
    },
  });
}

export async function confirmTicketCheckinCore(ticketIdOrQrCode: string, deskSportId: string) {
  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { id: ticketIdOrQrCode },
        { qrCode: ticketIdOrQrCode },
      ],
    },
    include: { booking: { include: { turf: true, member: true } } },
  });

  if (!ticket) return { success: false as const, error: "Ticket not found." };
  if (ticket.status !== "VALID") return { success: false as const, error: `Ticket is already ${ticket.status}.` };
  if (ticket.booking.sportId !== deskSportId) {
    return { success: false as const, error: "Ticket is not for the selected sport." };
  }

  const timingValidation = validateTicketTiming(
    ticket.booking.startTime,
    ticket.booking.turf.bookingValidityDays || 0
  );

  if (!timingValidation.valid) {
    return { success: false as const, error: timingValidation.error || "Ticket validation failed." };
  }

  const sport = await prisma.sport.findUnique({ where: { id: ticket.booking.sportId } });

  await prisma.$transaction(async (tx) => {
    await tx.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "CHECKED_IN",
        usedAt: new Date(),
      },
    });

    if (sport && sport.rewardPointsPerCheckin > 0) {
      await tx.member.update({
        where: { id: ticket.booking.memberId },
        data: { loyaltyPoints: { increment: sport.rewardPointsPerCheckin } },
      });
      await tx.loyaltyHistory.create({
        data: {
          memberId: ticket.booking.memberId,
          points: sport.rewardPointsPerCheckin,
          type: "EARNED",
          source: "CHECKIN",
          description: `Earned for checking into booking: ${sport.name}`,
        },
      });
    }
  });

  return {
    success: true as const,
    ticket,
    sportName: sport?.name || "Sportsvilla",
  };
}
