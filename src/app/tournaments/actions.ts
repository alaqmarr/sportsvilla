'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createTournament(data: any) {
  try {
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        participationFee: parseFloat(data.participationFee) || 0,
        teamSize: parseInt(data.teamSize) || 1,
        maxTeams: data.maxTeams ? parseInt(data.maxTeams) : null,
        thumbnail: data.thumbnail,
        rules: data.rules,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'UPCOMING',
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        prizePool: data.prizePool || null,
        venue: data.venue || null,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        sportId: data.sportId || null,
        paymentUpiId: data.paymentUpiId || null,
        acceptsCash: data.acceptsCash || false,
        cashResponsiblePerson: data.cashResponsiblePerson || null,
      }
    });
    revalidatePath('/tournaments');
    return { success: true, tournament };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getTournaments() {
  return await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { registrations: true }
      }
    }
  });
}

export async function getRegistrations(tournamentId: string) {
  return await prisma.tournamentRegistration.findMany({
    where: { tournamentId },
    include: {
      registeredBy: { select: { name: true, mobile: true } },
      players: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateRegistrationStatus(registrationId: string, status: string) {
  try {
    await prisma.tournamentRegistration.update({
      where: { id: registrationId },
      data: { status }
    });
    revalidatePath(`/tournaments`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateTournament(id: string, data: any) {
  try {
    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        participationFee: parseFloat(data.participationFee) || 0,
        teamSize: parseInt(data.teamSize) || 1,
        maxTeams: data.maxTeams ? parseInt(data.maxTeams) : null,
        thumbnail: data.thumbnail,
        rules: data.rules,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'UPCOMING',
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        prizePool: data.prizePool || null,
        venue: data.venue || null,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        sportId: data.sportId || null,
        paymentUpiId: data.paymentUpiId || null,
        acceptsCash: data.acceptsCash || false,
        cashResponsiblePerson: data.cashResponsiblePerson || null,
      }
    });
    revalidatePath('/tournaments');
    revalidatePath(`/tournaments/${id}`);
    return { success: true, tournament };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTournament(id: string) {
  try {
    await prisma.tournament.delete({ where: { id } });
    revalidatePath('/tournaments');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function manualEnrolment(tournamentId: string, data: { teamName: string; players: {name: string, mobile: string}[]; registeredByMobile: string }) {
  try {
    let member = await prisma.member.findFirst({ where: { mobile: data.registeredByMobile } });
    if (!member) {
      member = await prisma.member.create({
        data: {
          id: `${data.registeredByMobile}_${Date.now()}`,
          mobile: data.registeredByMobile,
          name: data.players[0]?.name || "Manual Enrolment",
        }
      });
    }

    const registration = await prisma.tournamentRegistration.create({
      data: {
        tournamentId,
        teamName: data.teamName,
        status: "VERIFIED",
        registeredById: member.id,
        paymentUtr: "MANUAL_CASH",
        paymentMethod: "CASH",
        players: {
          create: data.players.map(p => ({
            name: p.name,
            mobile: p.mobile,
            memberId: p.mobile === member?.mobile ? member.id : null
          }))
        }
      }
    });

    revalidatePath(`/tournaments/${tournamentId}`);
    return { success: true, registration };
  } catch (error: any) {
    return { error: error.message };
  }
}
