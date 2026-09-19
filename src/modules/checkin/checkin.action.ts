"use server";

import { revalidatePath } from "next/cache";
import {
  fetchSportsForCheckinCore,
  lookupTicketCore,
  confirmTicketCheckinCore,
} from "./checkin.lib";
import { eventBus } from "@/core/events";

export async function fetchSportsForCheckin() {
  return await fetchSportsForCheckinCore();
}

export async function lookupTicket(query: string) {
  return await lookupTicketCore(query);
}

export async function confirmTicketCheckin(ticketIdOrQrCode: string, deskSportId: string) {
  const result = await confirmTicketCheckinCore(ticketIdOrQrCode, deskSportId);

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/", "layout");

  eventBus.emit("checkin.confirmed", {
    ticketId: result.ticket.id,
    bookingId: result.ticket.bookingId,
    memberId: result.ticket.booking?.memberId,
    memberName: result.ticket.booking?.member?.name || "",
    sportName: result.sportName || "Sportsvilla",
    mobile: result.ticket.booking?.member?.mobile || null,
  });

  return { success: true };
}
