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

  // Helper to calculate Date objects from selected slots
  const convertTo24Hour = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const calculateSlotTimes = () => {
    const dateStrAPI = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const firstSlot = selectedSlots[0];
    const lastSlot = selectedSlots[selectedSlots.length - 1];

    const startDateTime = new Date(`${dateStrAPI}T${convertTo24Hour(firstSlot)}:00+05:30`);
    const durationMins = selectedTurfDetails?.bookingDurationMinutes || 60;
    const endDateTime = new Date(`${dateStrAPI}T${convertTo24Hour(lastSlot)}:00+05:30`);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMins);
    return { startDateTime, endDateTime };
  };

  const handleConfirmBooking = async (
    promoCode: string,
    walletDeduction: number,
    pointsDeduction: number,
    walletOtp?: string,
    preferredGateway?: string,
    cardUid?: string,
    paymentResponse?: any
  ) => {
    if (!selectedTurf) return;

    if (preferredGateway === 'SPORTSVILLA_CARD' && paymentResponse?.bookingId) {
      setIsCheckoutOpen(false);
      setProcessStatus('success');
      setTimeout(() => {
        router.push(`/play/bookings/${paymentResponse.bookingId}`);
      }, 1500);
      return;
    }

    const { startDateTime, endDateTime } = calculateSlotTimes();

    setProcessStatus('processing');
    try {
      const configRes = await fetch('/api/client/v1/payments/config');
      const configData = await configRes.json();
      const gateway = configData?.config?.activeGateway || 'NONE';
      
      let finalGateway = gateway;
      if (preferredGateway === 'SPORTSVILLA_CARD') {
        finalGateway = 'SPORTSVILLA_CARD';
      } else if (gateway === 'BOTH') {
        if (!preferredGateway) {
          setProcessStatus('error');
          setProcessMessage('Please select a payment method.');
          return;
        }
        finalGateway = preferredGateway;
      }

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
        if (finalGateway === 'SPORTSVILLA_CARD') {
          if (cardUid && result.booking.amountDue > 0) {
            const payRes = await fetch('/api/nfc/pay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cardUid,
                bookingId: result.booking.id,
                amount: result.booking.amountDue,
                description: `SportsVilla Card booking for ${selectedTurfDetails?.name || 'court'}`,
                deviceType: 'WEB_NFC'
              })
            });
            const payData = await payRes.json();
            if (!payData.success) {
              throw new Error(payData.message || payData.error || 'NFC card payment failed');
            }
          }
          setIsCheckoutOpen(false);
          setProcessStatus('success');
          setTimeout(() => {
            router.push(`/play/bookings/${result.booking.id}`);
          }, 1500);
          return;
        }
        if (result.booking.amountDue > 0) {
          try {
            if (finalGateway === 'RAZORPAY') {
              const paymentRes = await fetch('/api/client/v1/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId: result.booking.id,
                  gateway: 'RAZORPAY',
                  platform: 'WEB'
                })
              });
              
              const paymentData = await paymentRes.json();
              if (paymentData.success && paymentData.orderId) {
                const loadRazorpayScript = () => {
                  return new Promise((resolve) => {
                    if ((window as any).Razorpay) return resolve(true);
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                  });
                };
                
                const loaded = await loadRazorpayScript();
                if (!loaded) throw new Error('Razorpay SDK failed to load');

                const options = {
                  key: paymentData.keyId,
                  amount: paymentData.amount * 100,
                  currency: 'INR',
                  name: 'Sportsvilla',
                  description: 'Court Booking',
                  order_id: paymentData.orderId,
                  config: {
                    display: {
                      blocks: {
                        upi: {
                          name: "Pay via UPI QR",
                          instruments: [
                            {
                              method: "upi",
                              flows: ["qr"]
                            }
                          ]
                        }
                      },
                      sequence: ['block.upi'],
                      preferences: {
                        show_default_blocks: false
                      }
                    }
                  },
                  handler: async function (response: any) {
                    setProcessStatus('processing');
                    const verifyRes = await fetch('/api/client/v1/payments/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        bookingId: result.booking.id,
                        gateway: 'RAZORPAY',
                        orderId: response.razorpay_order_id,
                        paymentId: response.razorpay_payment_id,
                        signature: response.razorpay_signature
                      })
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                      setProcessStatus('success');
                      setTimeout(() => {
                        router.push(`/play/bookings/${result.booking.id}`);
                      }, 1500);
                    } else {
                      setProcessStatus('error');
                      setProcessMessage(verifyData.error || 'Payment verification failed');
                    }
                  },
                  modal: {
                    ondismiss: () => {
                      setProcessStatus('idle');
                      setIsCheckoutOpen(false);
                    }
                  },
                  prefill: {
                    name: member.name,
                    contact: member.mobile
                  },
                  theme: { color: '#22c55e' }
                };
                
                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function () {
                  setProcessStatus('error');
                  setProcessMessage('Payment failed or was cancelled.');
                });
                setIsCheckoutOpen(false);
                rzp.open();
                return;
              } else {
                throw new Error(paymentData.error || 'Failed to initiate Razorpay payment');
              }
            } else if (finalGateway === 'PHONEPE') {
              const paymentRes = await fetch('/api/client/v1/payments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId: result.booking.id,
                  gateway: 'PHONEPE',
                  platform: 'WEB'
                })
              });
              
              const paymentData = await paymentRes.json();
              if (paymentData.success && paymentData.redirectUrl) {
                window.location.href = paymentData.redirectUrl;
                return;
              } else {
                throw new Error(paymentData.error || 'Failed to initiate PhonePe payment');
              }
            } else {
              throw new Error('No active payment gateway configured');
            }
          } catch (e: any) {
            console.error('Payment initiation failed', e);
            setIsCheckoutOpen(false);
            setProcessStatus('error');
            setProcessMessage(e.message || 'Payment initiation failed');
            return; // Stop here, don't redirect to success!
          }
        }
        
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
                    onSelect={(id) => setSelectedTurf(selectedTurf === id ? null : id)}
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
              type="button"
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
            createBooking={async () => {
              const { startDateTime, endDateTime } = calculateSlotTimes();
              const res = await fetch('/api/client/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  memberId: member.id,
                  turfId: selectedTurf,
                  sportId: selectedSportId,
                  startTime: startDateTime.toISOString(),
                  endTime: endDateTime.toISOString(),
                  participantCount: 1,
                  walletAmountToUse: 0,
                  pointsAmountToUse: 0
                }),
              });
              const data = await res.json();
              if (!res.ok || !data.booking) {
                throw new Error(data.error || 'Failed to initialize booking');
              }
              return data.booking.id;
            }}
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
