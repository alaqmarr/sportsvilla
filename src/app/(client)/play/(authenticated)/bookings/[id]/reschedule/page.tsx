'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { DatePicker } from '@/components/play/DatePicker';
import { SportChips } from '@/components/play/SportChips';
import { SlotGrid } from '@/components/play/SlotGrid';
import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAlert } from '@/components/AlertProvider';
import { PlayCard } from '@/components/play/ui/PlayCard';
import { PlayButton } from '@/components/play/ui/PlayButton';
import { PlayBadge } from '@/components/play/ui/PlayBadge';
import { PlaySkeleton } from '@/components/play/ui/PlaySkeleton';
import { PlayEmptyState } from '@/components/play/ui/PlayEmptyState';
import { formatIST } from '@/lib/dateUtils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReschedulePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showAlert } = useAlert();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: bookingResponse, isLoading: isLoadingBooking } = useSWR(`/api/client/v1/bookings/${id}`, fetcher);
  const booking = bookingResponse?.booking;

  const dateStr = selectedDate.toISOString().split('T')[0];
  const { data: availability, isLoading: isLoadingSlots } = useSWR(
    booking ? `/api/client/v1/availability?sportId=${booking.sport.id}&turfId=${booking.turf.id}&date=${dateStr}` : null,
    fetcher
  );

  const handleConfirm = async () => {
    if (selectedSlots.length === 0) return;
    setIsSubmitting(true);
    try {
      const selectedSlotObjects = availability?.turfs?.[0]?.slots?.filter((s: any) => selectedSlots.includes(s.time)) || [];
      if (selectedSlotObjects.length === 0) return;

      const newStartTime = selectedSlotObjects[0].startTime;
      const newEndTime = selectedSlotObjects[selectedSlotObjects.length - 1].endTime;

      const res = await fetch(`/api/client/v1/bookings/${id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStartTime, newEndTime }),
      });
      if (res.ok) {
        router.push(`/play/bookings/${id}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        showAlert('Error', errorData.error || 'Failed to reschedule', 'error');
      }
    } catch (error) {
      showAlert('Error', 'Error scheduling', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingBooking) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <PlaySkeleton variant="rectangular" height={50} className="rounded-play-xl" />
        <PlaySkeleton variant="card" height={120} />
        <PlaySkeleton variant="card" height={300} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <PlayEmptyState
          title="Booking Not Found"
          description="We could not locate this reservation for rescheduling."
          actionText="Back to Bookings"
          actionHref="/play/bookings"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-play-bg text-play-text font-play pb-24 relative max-w-4xl mx-auto w-full">
      <header className="sticky top-0 z-20 bg-play-surface border-b border-play-border px-4 py-3.5 flex items-center gap-3">
        <Link href={`/play/bookings/${id}`} className="text-play-text-muted hover:text-play-text p-1 -ml-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-lg font-black text-play-text tracking-tight">Reschedule Pass</h1>
          <p className="text-xs text-play-text-muted">Choose a new playing time for this reservation</p>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Original Booking Recap */}
        <PlayCard variant="default" padding="md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-play-text-muted">
              Current Reservation
            </span>
            <PlayBadge variant="brand" size="sm">
              {booking.sport?.name}
            </PlayBadge>
          </div>
          <h3 className="font-extrabold text-base text-play-text">{booking.turf?.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-play-text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-play-brand" />
              <span>{formatIST(new Date(booking.startTime), 'EEEE, MMM d')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-play-brand" />
              <span>
                {formatIST(new Date(booking.startTime), 'h:mm a')} - {formatIST(new Date(booking.endTime), 'h:mm a')}
              </span>
            </div>
          </div>
        </PlayCard>

        {/* Date Selection */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-play-text-muted mb-2">
            1. Select New Date
          </h2>
          <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
        </section>

        {/* Slot Grid */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-play-text-muted">
              2. Select New Slot
            </h2>
            {selectedSlots.length > 0 && (
              <PlayBadge variant="brand" size="sm">
                {selectedSlots.length} Selected
              </PlayBadge>
            )}
          </div>
          {isLoadingSlots ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <PlaySkeleton variant="card" height={160} className="w-full" />
            </div>
          ) : (
            <SlotGrid
              slots={availability?.turfs?.[0]?.slots || []}
              selectedSlots={selectedSlots}
              onChange={setSelectedSlots}
            />
          )}
        </section>
      </div>

      {/* Bottom Floating Bar */}
      <div className="sticky bottom-0 w-full bg-play-surface border-t border-play-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)] mt-auto z-20 p-4">
        <div className="max-w-md mx-auto w-full">
          <PlayButton
            variant="athletic"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            disabled={selectedSlots.length === 0 || isSubmitting}
            onClick={handleConfirm}
          >
            Confirm Reschedule
          </PlayButton>
        </div>
      </div>
    </div>
  );
}
