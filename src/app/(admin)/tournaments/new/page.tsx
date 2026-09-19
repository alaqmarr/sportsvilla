import { prisma } from '@/core/database/prisma';
import TournamentFormClient from '../TournamentFormClient';

export default async function NewTournamentPage() {
  const sports = await prisma.sport.findMany();
  return <TournamentFormClient sports={sports} />;
}
