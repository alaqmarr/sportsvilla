import { prisma } from '@/lib/prisma';
import { requireServerMember } from '@/lib/serverAuth';
import { formatIST, todayIST } from '@/lib/dateUtils';
import { BookCourtClient } from './BookCourtClient';
import { redirect } from 'next/navigation';

export default async function BookCourtPage(props: {
  searchParams: Promise<{ date?: string; sportId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const member = await requireServerMember();

  // Fetch all sports for the selector
  const sports = await prisma.sport.findMany({
    select: { id: true, name: true, iconPath: true },
    orderBy: { name: 'asc' },
  });

  if (sports.length === 0) {
    return <div className="p-10 text-center">No sports available.</div>;
  }

  const today = todayIST();
  const dateStr = searchParams.date || today;
  const sportId = searchParams.sportId || sports[0].id;

  let availability = { turfs: [] as any[] };

  // Fetch availability logic (same as API)
  const turfs = await prisma.turf.findMany({
    where: {
      sports: {
        some: { sportId },
      },
    },
  });

  if (turfs.length > 0) {
    const startOfDay = new Date(`${dateStr}T00:00:00.000+05:30`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999+05:30`);
    const turfIds = turfs.map((t) => t.id);

    const activeBookings = await prisma.booking.findMany({
      where: {
        turfId: { in: turfIds },
        status: { not: 'CANCELLED' },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    const OPEN_HOUR = 6;
    const CLOSE_HOUR = 23;

    availability.turfs = turfs.map((turf) => {
      const duration = turf.bookingDurationMinutes || 60;
      const price = turf.bookingPrice || 600;
      const capacity = turf.capacityPerSlot;

      const slots = [];
      let currentHour = OPEN_HOUR;
      let currentMin = 0;

      while (currentHour < CLOSE_HOUR) {
        const slotStart = new Date(
          `${dateStr}T${currentHour.toString().padStart(2, '0')}:${currentMin
            .toString()
            .padStart(2, '0')}:00+05:30`
        );
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        const overlappingBookings = activeBookings.filter(
          (b) =>
            b.turfId === turf.id &&
            b.startTime.getTime() < slotEnd.getTime() &&
            b.endTime.getTime() > slotStart.getTime()
        );

        const usedCapacity = overlappingBookings.reduce(
          (sum, b) => sum + b.participantCount,
          0
        );
        const availableCourts = Math.max(0, capacity - usedCapacity);
        const isAvailable = availableCourts > 0;

        if (slotStart.getTime() > Date.now()) {
          slots.push({
            time: formatIST(slotStart, 'hh:mm a'),
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            price,
            availableCourts,
            available: isAvailable,
          });
        }

        currentMin += duration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }

      return {
        id: turf.id,
        name: turf.name,
        iconPath: turf.iconPath,
        capacityPerSlot: capacity,
        slots,
      };
    });
  }

  return (
    <BookCourtClient
      member={member}
      sports={sports}
      availability={availability}
      initialDateStr={dateStr}
      initialSportId={sportId}
    />
  );
}
