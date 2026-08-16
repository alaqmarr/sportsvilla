'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { FilterChips } from '@/components/play/FilterChips';
import { BookingCard } from '@/components/play/BookingCard';
import { EmptyState } from '@/components/play/EmptyState';
import { Calendar } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BookingsPage() {
  const { member } = usePlayAuth();
  const [filter, setFilter] = useState('All');
  
  const { data, error, isLoading } = useSWR(
    member?.id ? `/api/client/v1/bookings?memberId=${member.id}` : null,
    fetcher
  );

  const filters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  const filteredBookings = data?.bookings?.filter((booking: any) => {
    if (filter === 'All') return true;
    return booking.status.toLowerCase() === filter.toLowerCase();
  }) || [];

  return (
    <main className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      <div className="p-4 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
        <h1 className="text-2xl font-bold font-outfit mb-4">My Bookings</h1>
        <FilterChips 
          options={[
            { id: 'All', label: 'All' },
            { id: 'Upcoming', label: 'Upcoming' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Cancelled', label: 'Cancelled' }
          ]}
          selectedId={filter}
          onSelect={setFilter}
        />
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-[var(--play-radius-md)]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">Failed to load bookings.</div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking: any) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <EmptyState 
            icon={Calendar}
            title="No bookings found"
            description={`You have no ${filter !== 'All' ? filter.toLowerCase() : ''} bookings at the moment.`}
            actionText="Book a Court"
            actionHref="/play/book"
          />
        )}
      </div>
    </main>
  );
}
