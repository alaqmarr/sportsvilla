import { prisma } from '@/lib/prisma';
import { requireServerMember } from '@/lib/serverAuth';
import { JoinGameClient } from './JoinGameClient';

export default async function JoinGamePage() {
  await requireServerMember(); // Ensure user is authenticated

  // Fetch Open Games
  const openGames = await prisma.booking.findMany({
    where: {
      visibility: 'OPEN',
      status: 'CONFIRMED',
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      turf: true,
      sport: true,
      member: {
        select: { id: true, name: true, mobile: true },
      },
      participants: {
        include: {
          member: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });

  // Fetch Sports
  const sports = await prisma.sport.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const sportOptions = sports.map((s) => ({ id: s.id, label: s.name }));

  const member = await prisma.member.findUnique({
    where: { id: (await requireServerMember()).id },
    select: { id: true, walletBalance: true, loyaltyPoints: true }
  });

  return (
    <JoinGameClient
      initialOpenGames={openGames}
      sportOptions={sportOptions}
      member={member}
    />
  );
}
