'use client';

import { useState } from 'react';
import { FilterChips } from '@/components/play/FilterChips';
import { BookingCard } from '@/components/play/BookingCard';
import { EmptyState } from '@/components/play/EmptyState';
import { Calendar } from 'lucide-react';

export function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
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

  return (
    <div className="text-[var(--play-text)] pb-24">
      <div className="p-4 sm:p-6 lg:p-8 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
        <h1 className="text-2xl font-bold text-[var(--play-text)] mb-4">My Purchases</h1>
        <FilterChips 
          options={[
            { id: 'Upcoming', label: 'Upcoming' },
            { id: 'Past', label: 'Past' },
            { id: 'Cancelled', label: 'Cancelled' }
          ]}
          selectedId={filter}
          onSelect={setFilter}
        />
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((booking: any) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Calendar}
            title={`No ${filter.toLowerCase()} purchases`}
            description={`You don't have any ${filter.toLowerCase()} passes or bookings.`}
            actionText="Book a Court"
            actionHref="/play/book"
          />
        )}
      </div>
    </div>
  );
}
