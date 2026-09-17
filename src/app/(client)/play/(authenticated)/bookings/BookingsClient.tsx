'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, ChevronRight, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { PlayCard } from '@/components/play/ui/PlayCard';
import { PlayBadge } from '@/components/play/ui/PlayBadge';
import { PlayButton } from '@/components/play/ui/PlayButton';
import { PlayEmptyState } from '@/components/play/ui/PlayEmptyState';
import { formatIST } from '@/lib/dateUtils';

export function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('Upcoming');

  const filteredBookings = initialBookings.filter((booking: any) => {
    if (filter === 'All') return true;

    const now = new Date();
    const endTime = new Date(booking.endTime);

    if (filter === 'Upcoming') return endTime > now && booking.status !== 'CANCELLED';
    if (filter === 'Past') return endTime <= now && booking.status !== 'CANCELLED';
    if (filter === 'Cancelled') return booking.status === 'CANCELLED';

    return true;
  });

  const filterOptions = [
    { id: 'Upcoming', label: 'Upcoming' },
    { id: 'Past', label: 'Past Games' },
    { id: 'Cancelled', label: 'Cancelled' },
    { id: 'All', label: 'All Bookings' },
  ];

  return (
    <div className="text-play-text font-play space-y-6 pb-24">
      {/* Header & Filter Row */}
      <div className="bg-play-surface border border-play-border rounded-play-xl p-5 sm:p-6 shadow-play-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-play-text tracking-tight">
            My Court Passes
          </h1>
          <p className="text-xs sm:text-sm text-play-text-muted mt-1">
            Review past games, view digital tickets, and show QR codes at reception.
          </p>
        </div>

        <Link href="/play/book">
          <PlayButton variant="athletic" size="md">
            Book New Court
          </PlayButton>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterOptions.map((opt) => {
          const isSelected = filter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`px-4 py-2 rounded-play-pill text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-play-brand text-white shadow-play-sm'
                  : 'bg-play-surface border border-play-border text-play-text-secondary hover:bg-play-surface-hover'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBookings.map((booking: any) => {
            const now = new Date();
            const end = new Date(booking.endTime);
            const isCancelled = booking.status === 'CANCELLED';
            const isCompleted = end <= now && !isCancelled;
            const isUpcoming = end > now && !isCancelled;

            const badgeVariant = isCancelled
              ? 'error'
              : isCompleted
              ? 'neutral'
              : booking.status === 'CONFIRMED'
              ? 'success'
              : 'warning';

            const statusText = isCancelled
              ? 'Cancelled'
              : isCompleted
              ? 'Completed'
              : booking.paymentStatus === 'UNPAID'
              ? 'Payment Due'
              : 'Confirmed';

            return (
              <PlayCard
                key={booking.id}
                variant="interactive"
                padding="md"
                onClick={() => router.push(`/play/bookings/${booking.id}`)}
                className="flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {booking.sport?.iconPath || '🏅'}
                      </span>
                      <span className="text-xs font-bold text-play-text-muted uppercase tracking-wider">
                        {booking.sport?.name || 'Sport'}
                      </span>
                    </div>
                    <PlayBadge variant={badgeVariant} size="sm" dot={isUpcoming}>
                      {statusText}
                    </PlayBadge>
                  </div>

                  <h3 className="font-extrabold text-lg text-play-text group-hover:text-play-brand-dark transition-colors mb-1">
                    {booking.turf?.name || 'Main Court'}
                  </h3>

                  <div className="space-y-1.5 text-xs text-play-text-muted mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-play-brand" />
                      <span>{formatIST(new Date(booking.startTime), 'EEEE, MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-play-brand" />
                      <span>
                        {formatIST(new Date(booking.startTime), 'h:mm a')} -{' '}
                        {formatIST(new Date(booking.endTime), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-play-border flex items-center justify-between">
                  <div className="text-xs font-mono font-bold text-play-text-light">
                    ID #{booking.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-extrabold text-play-brand">
                    <span>View Pass</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </PlayCard>
            );
          })}
        </div>
      ) : (
        <PlayEmptyState
          icon={Calendar}
          title={`No ${filter.toLowerCase()} passes`}
          description={`You don't have any ${filter.toLowerCase()} court bookings or passes right now.`}
          actionText="Book a Court Now"
          actionHref="/play/book"
        />
      )}
    </div>
  );
}

