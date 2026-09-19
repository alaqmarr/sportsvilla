import { getTournaments } from '@/modules/tournaments/tournaments.action';
import TournamentsListClient from './TournamentsListClient';

export default async function TournamentsPage() {
  const tournaments = await getTournaments();
  return <TournamentsListClient initialTournaments={tournaments} />;
}
