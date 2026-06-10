"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      status: "VALID", // Only look for tickets that haven't been consumed or cancelled
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

export async function confirmTicketCheckin(ticketId: string, deskSportId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { booking: { include: { turf: true } } }
  });

  if (!ticket) throw new Error("Ticket not found.");
  if (ticket.status !== "VALID") throw new Error(`Ticket is already ${ticket.status}.`);
  if (ticket.booking.sportId !== deskSportId) throw new Error("Ticket is not for the selected sport.");

  // Check validity dates
  const now = new Date();
  const startTime = new Date(ticket.booking.startTime);
  const validityEnd = new Date(startTime.getTime());
  validityEnd.setHours(23, 59, 59, 999);
  
  if (ticket.booking.turf.bookingValidityDays > 0) {
    validityEnd.setDate(validityEnd.getDate() + ticket.booking.turf.bookingValidityDays);
  }

  // Allow check-in a bit early (e.g. 1 hour before start time)
  const earlyAllowTime = new Date(startTime.getTime() - 60 * 60000);

  if (now < earlyAllowTime) {
    throw new Error("Too early to check-in. Booking starts at " + startTime.toLocaleTimeString());
  }

  if (now > validityEnd) {
    throw new Error("Ticket has expired.");
  }

  // Process checkin
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "CHECKED_IN",
      usedAt: new Date()
    }
  });

  revalidatePath("/", "layout");
  return { success: true };
}
