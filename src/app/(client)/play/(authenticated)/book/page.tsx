'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { usePlayAuth } from '@/components/play/PlayAuthProvider';
import { DatePicker } from '@/components/play/DatePicker';
import { SportChips } from '@/components/play/SportChips';
import { SlotGrid } from '@/components/play/SlotGrid';
import { ReviewPanel } from '@/components/play/ReviewPanel';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function BookCourtPage() {
  const router = useRouter();
  const { member } = usePlayAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSport, setSelectedSport] = useState<string>('Football');
  const [selectedTurf, setSelectedTurf] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  // Format date to YYYY-MM-DD for API
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const { data: availability, isLoading } = useSWR(
    `/api/client/v1/availability?date=${dateStr}&sport=${selectedSport}`,
    fetcher
  );

  const handleConfirmBooking = async () => {
    if (!selectedTurf || selectedSlots.length === 0 || !member) return;
    
    setIsBooking(true);
    try {
      const res = await fetch('/api/client/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.id,
          turfId: selectedTurf,
          date: dateStr,
          slots: selectedSlots,
          sport: selectedSport
        }),
      });
      
      const result = await res.json();
      if (res.ok && result.booking) {
        router.push(`/play/bookings/${result.booking.id}`);
      } else {
        alert(result.error || 'Booking failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while booking');
    } finally {
      setIsBooking(false);
    }
  };

  const selectedTurfDetails = availability?.turfs?.find((t: any) => t.id === selectedTurf);

  return (
    <main className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Main Column */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
          <h1 className="text-2xl font-bold font-outfit mb-4">Book a Court</h1>
          <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
          <div className="mt-4">
            <SportChips sports={['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball']} selectedSport={selectedSport} onChange={(sport: string) => {
              setSelectedSport(sport);
              setSelectedTurf(null);
              setSelectedSlots([]);
            }} />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 animate-pulse rounded-[var(--play-radius-md)]"></div>
              <div className="h-32 bg-gray-200 animate-pulse rounded-[var(--play-radius-md)]"></div>
            </div>
          ) : (
            availability?.turfs?.map((turf: any) => (
              <div key={turf.id} className="bg-[var(--play-surface)] rounded-[var(--play-radius-md)] p-4 border border-[var(--play-border)] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg font-outfit">{turf.name}</h3>
                    <p className="text-sm text-[var(--play-text-muted)]">{turf.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[var(--play-brand)]">₹{turf.pricePerHour}/hr</span>
                  </div>
                </div>
                
                <SlotGrid 
                  slots={turf.slots} 
                  selectedSlots={selectedTurf === turf.id ? selectedSlots : []}
                  onChange={(slots: string[]) => {
                    if (selectedTurf !== turf.id) {
                      setSelectedTurf(turf.id);
                    }
                    setSelectedSlots(slots);
                  }}
                />
              </div>
            ))
          )}
          {availability?.turfs?.length === 0 && (
            <div className="text-center py-10 text-[var(--play-text-muted)]">
              No courts available for this date and sport.
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar / Bottom Drawer */}
      {(selectedTurf && selectedSlots.length > 0) && (
        <div className="fixed bottom-0 left-0 right-0 md:static md:w-96 bg-[var(--play-surface)] border-t md:border-t-0 md:border-l border-[var(--play-border)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none z-20">
          <ReviewPanel 
            selectedSlots={selectedSlots}
            selectedTurf={selectedTurfDetails?.name || selectedTurf}
            price={selectedTurfDetails?.pricePerHour || 0}
            walletBalance={member?.walletBalance || 0}
            pointsBalance={member?.loyaltyPoints || 0}
            onApplyCoupon={(code) => console.log('Coupon:', code)}
            onRedeemPoints={() => console.log('Redeem')}
            onConfirm={handleConfirmBooking}
          />
        </div>
      )}
    </main>
  );
}
