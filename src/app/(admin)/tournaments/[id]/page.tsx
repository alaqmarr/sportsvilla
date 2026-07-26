import { prisma } from '@/lib/prisma';
import TournamentDetailsClient from './TournamentDetailsClient';
import { notFound } from 'next/navigation';

export default async function TournamentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { id }
  });

  if (!tournament) {
    return notFound();
  }

  const sports = await prisma.sport.findMany();
  
  const registrations = await prisma.tournamentRegistration.findMany({
    where: { tournamentId: id },
    include: {
      registeredBy: { select: { name: true, mobile: true } },
      players: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <TournamentDetailsClient 
      tournament={tournament} 
      registrations={registrations} 
      sports={sports} 
    />
  );
}
