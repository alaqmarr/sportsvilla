'use client';

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { ArrowLeft } from 'lucide-react';
import { DigitalPass } from '@/components/play/DigitalPass';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  // Poll every 3 seconds for status change if booking is confirmed
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/client/v1/bookings/${id}` : null,
    fetcher,
    {
      refreshInterval: (data) => (data?.booking?.status === 'CONFIRMED' ? 3000 : 0)
    }
  );

  const booking = data?.booking;

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const res = await fetch(`/api/client/v1/bookings/${id}/cancel`, {
        method: 'POST'
      });
      if (res.ok) {
        mutate();
      } else {
        const result = await res.json();
        alert(result.error || 'Failed to cancel booking');
      }
    } catch (e) {
      alert('An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--play-bg)] p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md h-96 bg-gray-200 animate-pulse rounded-[var(--play-radius-lg)]"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[var(--play-bg)] p-4 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Failed to load booking details.</p>
        <button onClick={() => router.back()} className="text-[var(--play-brand)] font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] pb-24">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 bg-[var(--play-surface)] rounded-full shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold font-outfit">Digital Pass</h1>
      </div>

      <div className="px-4 py-2 max-w-md mx-auto">
        {/* Pass Card Prominently Rendered */}
        <DigitalPass booking={booking} qrData={booking.id} />

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          {booking.status === 'CONFIRMED' && (
            <>
              <button className="w-full bg-[var(--play-brand)] text-white font-bold py-3.5 rounded-[var(--play-radius-md)] shadow-sm hover:bg-[var(--play-brand-dark)] transition-colors">
                Manage Game / Add Squad
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-[var(--play-surface)] border border-[var(--play-border)] font-semibold py-3 rounded-[var(--play-radius-md)] text-[var(--play-text)]">
                  Reschedule
                </button>
                <button 
                  onClick={handleCancel}
                  className="bg-[var(--play-surface)] border border-[var(--play-error)] font-semibold py-3 rounded-[var(--play-radius-md)] text-[var(--play-error)]">
                  Cancel
                </button>
              </div>
            </>
          )}
          
          {booking.status === 'COMPLETED' && (
            <button 
              onClick={() => router.push('/play/book')}
              className="w-full bg-[var(--play-surface)] border border-[var(--play-border)] font-semibold py-3.5 rounded-[var(--play-radius-md)] text-[var(--play-text)]">
              Book Again
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
