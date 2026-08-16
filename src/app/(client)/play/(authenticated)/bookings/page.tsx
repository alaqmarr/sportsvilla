import { prisma } from '@/lib/prisma';
import { requireServerMember } from '@/lib/serverAuth';
import { BookingsClient } from './BookingsClient';

export default async function BookingsPage() {
  const member = await requireServerMember();

  const familyMembers = await prisma.member.findMany({
    where: { mobile: member.mobile },
    select: { id: true }
  });
  const familyIds = familyMembers.map(m => m.id);

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { memberId: { in: familyIds } },
        { participants: { some: { memberId: { in: familyIds }, status: 'CONFIRMED' } } }
      ]
    },
    include: {
      turf: true,
      sport: true,
      tickets: true,
      member: { select: { name: true, id: true } },
      participants: {
        include: {
          member: { select: { id: true, name: true, mobile: true } },
        },
      },
    },
    orderBy: { startTime: 'desc' }
  });

  return <BookingsClient initialBookings={bookings} />;
}
