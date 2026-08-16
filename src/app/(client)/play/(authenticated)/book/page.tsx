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
  const [selectedSportId, setSelectedSportId] = useState<string | null>(null);
  const [selectedTurf, setSelectedTurf] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Fetch sports
  const { data: sportsData } = useSWR('/api/client/v1/sports', fetcher);
  const sports = sportsData?.sports || [];

  // Automatically select the first sport if none is selected
  if (sports.length > 0 && !selectedSportId) {
    setSelectedSportId(sports[0].id);
  }

  // Format date to YYYY-MM-DD for API
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const { data: availability, isLoading: isAvailabilityLoading } = useSWR(
    selectedSportId ? `/api/client/v1/availability?date=${dateStr}&sportId=${selectedSportId}` : null,
    fetcher
  );

  const isLoading = isAvailabilityLoading || (!sportsData && !sportsData?.error);

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
          sportId: selectedSportId
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
  
  // Calculate total price based on selected slots
  const totalPrice = selectedTurfDetails?.slots
    ?.filter((s: any) => selectedSlots.includes(s.time))
    .reduce((sum: number, s: any) => sum + (s.price || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-[var(--play-bg)] text-[var(--play-text)] flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Main Column */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 bg-[var(--play-surface)] sticky top-0 z-10 border-b border-[var(--play-border)]">
          <h1 className="text-2xl font-bold font-outfit mb-4">Book a Court</h1>
          <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
          <div className="mt-4">
            <SportChips 
              sports={sports} 
              selectedSportId={selectedSportId || ''} 
              onChange={(sportId: string) => {
                setSelectedSportId(sportId);
                setSelectedTurf(null);
                setSelectedSlots([]);
              }} 
            />
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
                    <span className="font-bold text-[var(--play-brand)]">₹{turf.slots?.[0]?.price || 0}/hr</span>
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

      {/* Right Sidebar (Desktop) */}
      {(selectedTurf && selectedSlots.length > 0) && (
        <div className="hidden md:block md:w-96 bg-[var(--play-surface)] border-l border-[var(--play-border)] z-20">
          <ReviewPanel 
            selectedSlots={selectedSlots}
            selectedTurf={selectedTurfDetails?.name || selectedTurf}
            price={totalPrice}
            walletBalance={member?.walletBalance || 0}
            pointsBalance={member?.loyaltyPoints || 0}
            onApplyCoupon={(code) => console.log('Coupon:', code)}
            onRedeemPoints={() => console.log('Redeem')}
            onConfirm={handleConfirmBooking}
          />
        </div>
      )}

      {/* Mobile Sticky Button */}
      {(selectedTurf && selectedSlots.length > 0) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[var(--play-surface)] border-t border-[var(--play-border)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="w-full bg-[var(--play-brand)] text-white font-bold py-3.5 rounded-[var(--play-radius-md)] flex items-center justify-between px-6 shadow-md"
          >
            <span>Review Booking</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>
      )}

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
          <div className="w-full max-h-[90vh] bg-[var(--play-surface)] rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="p-4 border-b border-[var(--play-border)] flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg font-outfit">Booking Details</h3>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-[var(--play-text-muted)] hover:bg-gray-200 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ReviewPanel 
                selectedSlots={selectedSlots}
                selectedTurf={selectedTurfDetails?.name || selectedTurf}
                price={totalPrice}
                walletBalance={member?.walletBalance || 0}
                pointsBalance={member?.loyaltyPoints || 0}
                onApplyCoupon={(code) => console.log('Coupon:', code)}
                onRedeemPoints={() => console.log('Redeem')}
                onConfirm={handleConfirmBooking}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
