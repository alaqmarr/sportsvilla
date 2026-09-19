import { prisma } from "@/core/database/prisma";

export interface CreateTournamentInput {
  name: string;
  description?: string;
  participationFee?: number | string;
  teamSize?: number | string;
  maxTeams?: number | string | null;
  thumbnail?: string | null;
  rules?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  status?: string;
  isPublic?: boolean;
  prizePool?: string | null;
  venue?: string | null;
  registrationDeadline?: string | Date | null;
  sportId?: string | null;
  paymentUpiId?: string | null;
  acceptsCash?: boolean;
  cashResponsiblePerson?: string | null;
}

export interface ManualEnrolmentInput {
  teamName: string;
  players: { name: string; mobile: string }[];
  registeredByMobile: string;
}

export async function createTournamentCore(data: CreateTournamentInput) {
  return await prisma.tournament.create({
    data: {
      name: data.name,
      description: data.description || "",
      participationFee: typeof data.participationFee === "string" ? parseFloat(data.participationFee) || 0 : data.participationFee || 0,
      teamSize: typeof data.teamSize === "string" ? parseInt(data.teamSize) || 1 : data.teamSize || 1,
      maxTeams: data.maxTeams ? (typeof data.maxTeams === "string" ? parseInt(data.maxTeams) : data.maxTeams) : null,
      thumbnail: data.thumbnail,
      rules: data.rules,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status || "UPCOMING",
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      prizePool: data.prizePool || null,
      venue: data.venue || null,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      sportId: data.sportId || null,
      paymentUpiId: data.paymentUpiId || null,
      acceptsCash: data.acceptsCash || false,
      cashResponsiblePerson: data.cashResponsiblePerson || null,
    },
  });
}

export async function getTournamentsCore() {
  return await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });
}

export async function getRegistrationsCore(tournamentId: string) {
  return await prisma.tournamentRegistration.findMany({
    where: { tournamentId },
    include: {
      registeredBy: { select: { name: true, mobile: true } },
      players: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateRegistrationStatusCore(registrationId: string, status: string) {
  return await prisma.tournamentRegistration.update({
    where: { id: registrationId },
    data: { status },
  });
}

export async function updateTournamentCore(id: string, data: CreateTournamentInput) {
  return await prisma.tournament.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || "",
      participationFee: typeof data.participationFee === "string" ? parseFloat(data.participationFee) || 0 : data.participationFee || 0,
      teamSize: typeof data.teamSize === "string" ? parseInt(data.teamSize) || 1 : data.teamSize || 1,
      maxTeams: data.maxTeams ? (typeof data.maxTeams === "string" ? parseInt(data.maxTeams) : data.maxTeams) : null,
      thumbnail: data.thumbnail,
      rules: data.rules,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      status: data.status || "UPCOMING",
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      prizePool: data.prizePool || null,
      venue: data.venue || null,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      sportId: data.sportId || null,
      paymentUpiId: data.paymentUpiId || null,
      acceptsCash: data.acceptsCash || false,
      cashResponsiblePerson: data.cashResponsiblePerson || null,
    },
  });
}

export async function deleteTournamentCore(id: string) {
  return await prisma.tournament.delete({ where: { id } });
}

export async function manualEnrolmentCore(tournamentId: string, data: ManualEnrolmentInput) {
  let member = await prisma.member.findFirst({ where: { mobile: data.registeredByMobile } });
  if (!member) {
    member = await prisma.member.create({
      data: {
        id: `${data.registeredByMobile}_${Date.now()}`,
        mobile: data.registeredByMobile,
        name: data.players[0]?.name || "Manual Enrolment",
      },
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
        create: data.players.map((p) => ({
          name: p.name,
          mobile: p.mobile,
          memberId: p.mobile === member?.mobile ? member.id : null,
        })),
      },
    },
  });

  return registration;
}
