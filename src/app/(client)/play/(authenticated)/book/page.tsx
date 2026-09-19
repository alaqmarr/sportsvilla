import { prisma } from '@/core/database/prisma';
import { requireServerMember } from '@/core/auth/serverAuth';
import { todayIST } from '@/core/utils/dateUtils';
import { BookCourtClient } from './BookCourtClient';
import { AvailabilityService } from '@/modules/bookings/bookings.services';
import { PlayEmptyState } from '@/components/play/ui/PlayEmptyState';

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
    return (
      <div className="p-6 max-w-xl mx-auto">
        <PlayEmptyState
          title="No Sports Configured"
          description="There are currently no bookable sports available. Please check back later."
        />
      </div>
    );
  }

  const today = todayIST();
  const dateStr = searchParams.date || today;
  const sportId = searchParams.sportId || sports[0].id;

  const turfs = await AvailabilityService.getAvailability(dateStr, sportId);
  const availability = { turfs };

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
