"use server";

import { revalidatePath } from "next/cache";
import {
  createTournamentCore,
  getTournamentsCore,
  getRegistrationsCore,
  updateRegistrationStatusCore,
  updateTournamentCore,
  deleteTournamentCore,
  manualEnrolmentCore,
  CreateTournamentInput,
  ManualEnrolmentInput,
} from "./tournaments.lib";

export async function createTournament(data: CreateTournamentInput) {
  try {
    const tournament = await createTournamentCore(data);
    revalidatePath("/tournaments");
    return { success: true, tournament };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTournaments() {
  return await getTournamentsCore();
}

export async function getRegistrations(tournamentId: string) {
  return await getRegistrationsCore(tournamentId);
}

export async function updateRegistrationStatus(registrationId: string, status: string) {
  try {
    await updateRegistrationStatusCore(registrationId, status);
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTournament(id: string, data: CreateTournamentInput) {
  try {
    const tournament = await updateTournamentCore(id, data);
    revalidatePath("/tournaments");
    revalidatePath(`/tournaments/${id}`);
    return { success: true, tournament };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTournament(id: string) {
  try {
    await deleteTournamentCore(id);
    revalidatePath("/tournaments");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function manualEnrolment(tournamentId: string, data: ManualEnrolmentInput) {
  try {
    const registration = await manualEnrolmentCore(tournamentId, data);
    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, registration };
  } catch (error: any) {
    return { error: error.message };
  }
}
