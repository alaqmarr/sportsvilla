'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Modal } from '@/components/play/Modal';
import { DatePicker } from '@/components/play/DatePicker';
import { TimePicker } from '@/components/play/TimePicker';
import { CourtCard } from '@/components/play/CourtCard';
import { SportSelectorModal } from '@/components/play/SportSelectorModal';
import { ReviewPanel } from '@/components/play/ReviewPanel';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ProcessingDialog, ProcessStatus } from '@/components/play/ProcessingDialog';
import Link from 'next/link';

export function BookCourtClient({ member, sports, availability, initialDateStr, initialSportId }: { member: any, sports: any[], availability: any, initialDateStr: string, initialSportId: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [year, month, day] = initialDateStr.split('-');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
  const [selectedSportId, setSelectedSportId] = useState<string | null>(initialSportId || (sports.length > 0 ? sports[0].id : null));
  const [selectedTurf, setSelectedTurf] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSportModalOpen, setIsSportModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [processMessage, setProcessMessage] = useState('');

  // When date changes locally, update URL to trigger server fetch
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    if (selectedSportId) params.set('sportId', selectedSportId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSportId(sportId);
    setIsSportModalOpen(false);
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    params.set('sportId', sportId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const activeSport = sports.find((s: any) => s.id === selectedSportId);
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedTurfDetails = availability?.turfs?.find((t: any) => t.id === selectedTurf);

  const handleConfirmBooking = async (promoCode: string, walletDeduction: number, pointsDeduction: number, walletOtp?: string) => {
    if (!selectedTurf) return;
    
    // Create Date objects from selected slots
    const convertTo24Hour = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      if (hours === '12') hours = '00';
      if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
      return `${hours.padStart(2, '0')}:${minutes}`;
    };
    
    const dateStrAPI = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const firstSlot = selectedSlots[0];
    const lastSlot = selectedSlots[selectedSlots.length - 1];

    const startDateTime = new Date(`${dateStrAPI}T${convertTo24Hour(firstSlot)}:00+05:30`);
    const durationMins = selectedTurfDetails?.bookingDurationMinutes || 60;
    const endDateTime = new Date(`${dateStrAPI}T${convertTo24Hour(lastSlot)}:00+05:30`);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMins);

    setProcessStatus('processing');
    try {
      const res = await fetch('/api/client/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: member.id,
          turfId: selectedTurf,
          sportId: selectedSportId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          participantCount: 1,
          couponCode: promoCode || undefined,
          walletAmountToUse: walletDeduction || 0,
          walletOtp: walletOtp || undefined,
          pointsAmountToUse: pointsDeduction || 0
        }),
      });
      
      const result = await res.json();
      if (res.ok && result.booking) {
        setIsCheckoutOpen(false);
        setProcessStatus('success');
        setTimeout(() => {
          router.push(`/play/bookings/${result.booking.id}`);
        }, 1500);
      } else {
        setProcessStatus('error');
        setProcessMessage(result.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      setProcessStatus('error');
      setProcessMessage('An error occurred while booking');
    }
  };

  const totalPrice = selectedTurfDetails?.slots
    ?.filter((s: any) => selectedSlots.includes(s.time))
    .reduce((sum: number, s: any) => sum + (s.price || 0), 0) || 0;

  const getAggregateSlots = () => {
    if (!availability?.turfs || availability.turfs.length === 0) return [];
    const templateSlots = availability.turfs[0].slots || [];
    return templateSlots.map((slotTemplate: any) => {
      const isAvailableInAny = availability.turfs.some((turf: any) => {
        const matchingSlot = turf.slots?.find((s: any) => s.time === slotTemplate.time);
        return matchingSlot && matchingSlot.available;
      });
      return {
        ...slotTemplate,
        available: isAvailableInAny
      };
    });
  };

  const isTurfAvailableForSelectedSlots = (turf: any) => {
    if (selectedSlots.length === 0) return true;
    return selectedSlots.every(selectedTime => {
      const matchingSlot = turf.slots?.find((s: any) => s.time === selectedTime);
      return matchingSlot && matchingSlot.available;
    });
  };

  const sampleSlots = selectedTurfDetails?.slots || getAggregateSlots();

  return (
    <div className="flex flex-col h-full relative pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-[var(--play-bg)]/80 backdrop-blur-md z-10 w-full border-b border-[var(--play-border)]">
        <div className="p-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link href="/play/dashboard" className="p-2 -ml-2 rounded-full hover:bg-[var(--play-surface-alt)] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold font-outfit">Select Slots</h1>
        </div>
        <button 
          onClick={() => setIsSportModalOpen(true)}
          className="px-4 py-2 bg-[var(--play-surface)] border border-[var(--play-border)] rounded-xl shadow-sm text-sm font-medium hover:bg-[var(--play-surface-alt)] transition-colors"
        >
          {activeSport?.name || 'Select Sport'}
        </button>
        </div>
      </div>

      <div className="pt-4 max-w-3xl mx-auto w-full">
        <DatePicker selectedDate={selectedDate} onChange={handleDateChange} />
        
        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--play-bg)] pointer-events-none h-full z-10 hidden"></div>
          <TimePicker 
            slots={sampleSlots} 
            selectedSlots={selectedSlots} 
            onChange={setSelectedSlots} 
          />
        </div>

        <div className="mt-8">
          <h2 className="px-4 text-[var(--play-text)] font-bold text-lg mb-4">Courts</h2>
          
          {availability?.turfs?.length > 0 && (
            <>
              <div className="px-6 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {availability?.turfs?.map((turf: any) => (
                  <CourtCard
                    key={turf.id}
                    id={turf.id}
                    name={turf.name}
                    price={turf.slots?.[0]?.price || 0}
                    isSelected={selectedTurf === turf.id}
                    onSelect={(id) => setSelectedTurf(id)}
                    icon={turf.iconPath ? <img src={turf.iconPath} alt={turf.name} className="w-8 h-8 object-contain" /> : undefined}
                    disabled={!isTurfAvailableForSelectedSlots(turf)}
                  />
                ))}
              </div>
            </>
          )}

          {availability?.turfs?.length === 0 && (
            <div className="text-center py-10 text-[var(--play-text-muted)]">
              No courts available for this date and sport.
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      {selectedSlots.length > 0 && selectedTurf && (
        <div className="sticky bottom-0 w-full bg-[var(--play-surface)] border-t border-[var(--play-border)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-8 z-20 mt-auto">
          <div className="p-4 max-w-3xl mx-auto w-full">
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full bg-[var(--play-brand)] text-white font-bold py-4 rounded-[var(--play-radius-md)] shadow-lg active:scale-95 transition-transform flex justify-between px-6"
            >
              <span>Book Now</span>
              <span>INR {totalPrice}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <SportSelectorModal 
        isOpen={isSportModalOpen}
        onClose={() => setIsSportModalOpen(false)}
        sports={sports}
        selectedSportId={selectedSportId as string}
        onSelect={handleSportChange}
      />

      {isCheckoutOpen && (
        <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} size="lg" noPadding>
          <ReviewPanel 
            selectedSlots={selectedSlots}
            timeDisplayOverride={
              (() => {
                const selectedSlotObjects = sampleSlots.filter((s: any) => selectedSlots.includes(s.time));
                if (selectedSlotObjects.length === 0) return '--:--';
                const start = new Date(selectedSlotObjects[0].startTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
                const end = new Date(selectedSlotObjects[selectedSlotObjects.length - 1].endTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
                return `${start} - ${end}`;
              })()
            }
            selectedTurf={selectedTurfDetails?.name || selectedTurf || ''}
            price={totalPrice}
            walletBalance={(member?.walletBalance || 0) / 100}
            pointsBalance={member?.loyaltyPoints || 0}
            onApplyCoupon={() => {}}
            onRedeemPoints={() => {}}
            onConfirm={handleConfirmBooking}
          />
        </Modal>
      )}

      {/* Processing Dialog */}
      <ProcessingDialog 
        isOpen={processStatus !== 'idle'} 
        status={processStatus}
        errorMessage={processMessage}
        onClose={() => setProcessStatus('idle')}
      />
    </div>
  );
}
