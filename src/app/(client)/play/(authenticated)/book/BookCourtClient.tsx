'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Check,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { PlayModal } from '@/components/play/ui/PlayModal';
import { PlayCard } from '@/components/play/ui/PlayCard';
import { PlayBadge } from '@/components/play/ui/PlayBadge';
import { PlayButton } from '@/components/play/ui/PlayButton';
import { PlayEmptyState } from '@/components/play/ui/PlayEmptyState';
import { ReviewPanel } from '@/components/play/ReviewPanel';
import { ProcessingDialog, ProcessStatus } from '@/components/play/ProcessingDialog';
import { formatIST } from '@/lib/dateUtils';
import { allocateTurfsForSlots, Booking as AllocBooking } from '@/lib/allocationEngine';
import { rawPlayTokens } from '@/lib/tokens';

function generateSlots(dateStr: string, durationMin: number, openTime: string = "06:00", closeTime: string = "23:00") {
  const slots = [];
  const start = new Date(dateStr);
  const [openHour, openMin] = openTime.split(':').map(Number);
  start.setHours(openHour, openMin, 0, 0);

  const end = new Date(dateStr);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  end.setHours(closeHour, closeMin, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  let current = new Date(start);
  const now = new Date();
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMin * 60000);
    if (slotEnd > end) break;
    
    if (current > now) {
      slots.push({
        startTime: new Date(current),
        endTime: slotEnd,
        label: formatIST(current, 'h:mm a'),
      });
    }
    current = slotEnd;
  }
  return slots;
}

export function BookCourtClient({
  member,
  sports,
  availability,
  initialDateStr,
  initialSportId,
}: {
  member: any;
  sports: any[];
  availability: any;
  initialDateStr: string;
  initialSportId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [year, month, day] = initialDateStr.split('-');
  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  );
  const [selectedSportId, setSelectedSportId] = useState<string | null>(
    initialSportId || (sports.length > 0 ? sports[0].id : null)
  );
  const [selectedTurf, setSelectedTurf] = useState<string | null>(
    availability?.turfs?.[0]?.id || null
  );
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSportDrawerOpen, setIsSportDrawerOpen] = useState(false);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('idle');
  const [processMessage, setProcessMessage] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const activeSport = sports.find((s: any) => s.id === selectedSportId) || sports[0];
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedTurfDetails = availability?.turfs?.find((t: any) => t.id === selectedTurf) || availability?.turfs?.[0];

  // Keep selectedTurf valid if turfs update
  useEffect(() => {
    if (availability?.turfs?.length > 0) {
      if (!selectedTurf || !availability.turfs.some((t: any) => t.id === selectedTurf)) {
        setSelectedTurf(availability.turfs[0].id);
      }
    }
  }, [availability, selectedTurf]);

  // Date strip generation (14 days)
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    const nextDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', nextDateStr);
    if (selectedSportId) params.set('sportId', selectedSportId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSportId(sportId);
    setSelectedSlots([]);
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    params.set('sportId', sportId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const convertTo24Hour = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const calculateSlotTimes = () => {
    const firstSlot = selectedSlots[0];
    const lastSlot = selectedSlots[selectedSlots.length - 1];

    const startDateTime = new Date(`${dateStr}T${convertTo24Hour(firstSlot)}:00+05:30`);
    const durationMins = selectedTurfDetails?.bookingDurationMinutes || activeSport?.slotDurationMinutes || 60;
    const endDateTime = new Date(`${dateStr}T${convertTo24Hour(lastSlot)}:00+05:30`);
    endDateTime.setMinutes(endDateTime.getMinutes() + durationMins);
    return { startDateTime, endDateTime };
  };

  const slotDuration = activeSport?.slotDurationMinutes || 60;
  const openTime = activeSport?.openTime || '06:00';
  const closeTime = activeSport?.closeTime || '23:00';

  const generatedSlots = useMemo(
    () => generateSlots(dateStr, slotDuration, openTime, closeTime),
    [dateStr, slotDuration, openTime, closeTime]
  );

  const dummyBookings = useMemo<AllocBooking[]>(() => {
    if (!availability?.turfs) return [];
    return availability.turfs.flatMap((turf: any) =>
      (turf.slots || [])
        .filter((s: any) => !s.available)
        .map((s: any) => {
          const [time, modifier] = s.time.split(' ');
          let [hours, minutes] = time.split(':');
          if (hours === '12') hours = '00';
          if (modifier === 'PM') hours = (parseInt(hours, 10) + 12).toString();
          const startTime = new Date(`${dateStr}T${hours.padStart(2, '0')}:${minutes}:00+05:30`);
          const endTime = new Date(startTime.getTime() + (turf.bookingDurationMinutes || 60) * 60000);
          return {
            turfId: turf.id,
            status: 'CONFIRMED',
            startTime,
            endTime,
            participantCount: turf.capacityPerSlot || 1,
          };
        })
    );
  }, [availability, dateStr]);

  const selectedSlotObjects = generatedSlots.filter((s) => selectedSlots.includes(s.label));

  const autoAllocation = useMemo(() => {
    if (selectedSlotObjects.length === 0) return null;
    return allocateTurfsForSlots(selectedSlotObjects, dummyBookings, availability?.turfs || []);
  }, [selectedSlotObjects, dummyBookings, availability]);

  const totalPrice = Math.round(
    autoAllocation
      ? autoAllocation.reduce((sum, a) => sum + a.price, 0)
      : selectedTurfDetails?.slots
      ? selectedTurfDetails.slots
          .filter((s: any) => selectedSlots.includes(s.time))
          .reduce((sum: number, s: any) => sum + (s.price || 0), 0)
      : (selectedTurfDetails?.bookingPrice || 0) * selectedSlots.length
  );

  const handleCellClick = (turfId: string, slotLabel: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedTurf !== turfId) {
      setSelectedTurf(turfId);
      setSelectedSlots([slotLabel]);
      return;
    }

    if (selectedSlots.includes(slotLabel)) {
      setSelectedSlots((prev) => prev.filter((s) => s !== slotLabel));
    } else {
      setSelectedSlots((prev) => {
        const next = [...prev, slotLabel];
        return next.sort((a, b) => {
          return generatedSlots.findIndex((s) => s.label === a) - generatedSlots.findIndex((s) => s.label === b);
        });
      });
    }
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
    const targetTurfId = selectedTurf || availability?.turfs?.[0]?.id;
    if (!targetTurfId) return;

    if (preferredGateway === 'SPORTSVILLA_CARD' && paymentResponse?.bookingId) {
      setIsCheckoutOpen(false);
      setConfirmedBookingId(paymentResponse.bookingId);
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

      const allocsToProcess = autoAllocation
        ? autoAllocation.map((a) => ({
            turfId: a.turfId,
            startTime: a.startTime.toISOString(),
            endTime: a.endTime.toISOString(),
          }))
        : [
            {
              turfId: targetTurfId,
              startTime: startDateTime.toISOString(),
              endTime: endDateTime.toISOString(),
            },
          ];

      let firstBookingResult: any = null;

      for (let i = 0; i < allocsToProcess.length; i++) {
        const alloc = allocsToProcess[i];
        const res = await fetch('/api/client/v1/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: member.id,
            turfId: alloc.turfId,
            sportId: selectedSportId,
            startTime: alloc.startTime,
            endTime: alloc.endTime,
            participantCount: 1,
            couponCode: i === 0 ? promoCode || undefined : undefined,
            walletAmountToUse: i === 0 ? walletDeduction || 0 : 0,
            walletOtp: i === 0 ? walletOtp || undefined : undefined,
            pointsAmountToUse: i === 0 ? pointsDeduction || 0 : 0,
          }),
        });

        const result = await res.json();
        if (res.ok && result.booking) {
          if (!firstBookingResult) {
            firstBookingResult = result;
          }
        } else if (!firstBookingResult) {
          firstBookingResult = result;
          break;
        }
      }

      const result = firstBookingResult;
      if (result && result.booking) {
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
                deviceType: 'WEB_NFC',
              }),
            });
            const payData = await payRes.json();
            if (!payData.success) {
              throw new Error(payData.message || payData.error || 'NFC card payment failed');
            }
          }
          setIsCheckoutOpen(false);
          setProcessStatus('idle');
          setConfirmedBookingId(result.booking.id);
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
                  platform: 'WEB',
                }),
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
                          name: 'Pay via UPI QR',
                          instruments: [{ method: 'upi', flows: ['qr'] }],
                        },
                      },
                      sequence: ['block.upi'],
                      preferences: { show_default_blocks: false },
                    },
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
                        signature: response.razorpay_signature,
                      }),
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                      setProcessStatus('idle');
                      setIsCheckoutOpen(false);
                      setConfirmedBookingId(result.booking.id);
                    } else {
                      setProcessStatus('error');
                      setProcessMessage(verifyData.error || 'Payment verification failed');
                    }
                  },
                  modal: {
                    ondismiss: () => {
                      setProcessStatus('idle');
                      setIsCheckoutOpen(false);
                    },
                  },
                  prefill: {
                    name: member.name,
                    contact: member.mobile,
                  },
                  theme: { color: rawPlayTokens.brand },
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
                  platform: 'WEB',
                }),
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
            return;
          }
        }

        setIsCheckoutOpen(false);
        setProcessStatus('idle');
        setConfirmedBookingId(result.booking.id);
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

  const turfsList = availability?.turfs || [];

  return (
    <div className="flex flex-col min-h-screen relative font-play text-play-text pb-28">
      {/* Top Header Bar */}
      <div className="sticky top-0 bg-play-surface/95 backdrop-blur-md z-30 border-b border-play-border px-4 py-3 sm:px-6 shadow-play-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/play/dashboard"
              className="p-2 -ml-2 rounded-play-md hover:bg-play-surface-hover transition-colors text-play-text-muted hover:text-play-text"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-play-text tracking-tight">
                Reserve Court
              </h1>
              <p className="text-xs text-play-text-muted hidden sm:block">
                Visual availability matrix with live pricing per cell
              </p>
            </div>
          </div>

          {/* Sport Picker Button */}
          <button
            onClick={() => setIsSportDrawerOpen(true)}
            className="flex items-center gap-3 bg-play-surface border border-play-border hover:border-play-brand text-play-text px-4 py-2 rounded-play-pill text-sm font-bold shadow-play-sm transition-colors cursor-pointer"
          >
            {activeSport?.iconPath ? (
              activeSport.iconPath.includes('.') ? (
                <img src={activeSport.iconPath} alt={activeSport.name} className="w-5 h-5 object-contain" />
              ) : (
                <span className="text-lg">{activeSport.iconPath}</span>
              )
            ) : (
              <span className="text-lg">🎾</span>
            )}
            <span>{activeSport?.name || 'Select Sport'}</span>
            <ChevronRight className="w-4 h-4 text-play-text-muted" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 space-y-6">
        {/* Horizontal Date Strip */}
        <div className="bg-play-surface border border-play-border rounded-play-xl p-3 sm:p-4 shadow-play-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-play-text-muted">
              <CalendarIcon size={14} className="text-play-brand" />
              <span>Select Playing Date</span>
            </div>
            <span className="text-xs font-semibold text-play-brand">
              {formatIST(selectedDate, 'MMMM yyyy')}
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {dateOptions.map((date, idx) => {
              const isDateSelected =
                date.getFullYear() === selectedDate.getFullYear() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getDate() === selectedDate.getDate();
              const isToday = idx === 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDateChange(date)}
                  className={`flex flex-col items-center justify-center min-w-[64px] sm:min-w-[72px] h-20 rounded-play-lg border transition-all cursor-pointer ${
                    isDateSelected
                      ? 'bg-play-brand border-play-brand text-white shadow-play-md scale-[1.03]'
                      : 'bg-play-surface border-play-border text-play-text hover:border-play-brand/40 hover:bg-play-surface-subtle'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDateSelected ? 'text-emerald-100' : 'text-play-text-muted'
                    }`}
                  >
                    {formatIST(date, 'EEE')}
                  </span>
                  <span className="text-xl sm:text-2xl font-black mt-0.5">
                    {formatIST(date, 'd')}
                  </span>
                  {isToday ? (
                    <span
                      className={`text-[9px] font-extrabold uppercase mt-0.5 px-1.5 rounded-play-pill ${
                        isDateSelected ? 'bg-white text-play-brand-dark' : 'bg-play-brand/10 text-play-brand'
                      }`}
                    >
                      Today
                    </span>
                  ) : (
                    <span className="text-[9px] opacity-0 mt-0.5">•</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-2 text-xs font-semibold text-play-text-secondary">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-play-sm bg-play-surface border border-play-border" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-play-sm bg-play-brand" />
              <span className="font-bold text-play-brand-dark">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-play-sm bg-play-surface-subtle border border-play-border opacity-60" />
              <span className="text-play-text-light">Booked</span>
            </div>
          </div>
          <div className="text-xs text-play-text-muted hidden md:block">
            Click any cell to toggle your slot selection
          </div>
        </div>

        {/* Visual Court/Time Availability Matrix */}
        {turfsList.length === 0 ? (
          <PlayEmptyState
            icon={CalendarIcon}
            title="No courts available"
            description="There are no courts configured for this sport on the selected date."
            actionText="Try Another Sport"
            onAction={() => {
              if (sports.length > 1) {
                const nextSport = sports.find((s: any) => s.id !== selectedSportId);
                if (nextSport) handleSportChange(nextSport.id);
              }
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* 1. Time Slot Grid */}
            <div className="bg-play-surface border border-play-border rounded-play-xl p-4 shadow-play-sm">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-play-text-muted">
                  <Clock size={14} className="text-play-brand" />
                  <span>Select Time Slots</span>
                </div>
                {selectedSlots.length > 0 && (
                  <button 
                    onClick={() => {
                      setSelectedSlots([]);
                      setSelectedTurf(null);
                    }}
                    className="text-xs font-bold text-play-text-muted hover:text-play-text underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {generatedSlots.map((slot) => {
                  const isAvailableGlobally = turfsList.some((turf: any) => {
                    const turfSlot = turf.slots?.find((s: any) => s.time === slot.label);
                    return turfSlot ? turfSlot.available : true;
                  });
                  const isSelected = selectedSlots.includes(slot.label);

                  return (
                    <button
                      key={slot.label}
                      type="button"
                      disabled={!isAvailableGlobally}
                      onClick={() => {
                        if (!isAvailableGlobally) return;
                        setSelectedSlots(prev => {
                          let next;
                          if (prev.includes(slot.label)) {
                            next = prev.filter(s => s !== slot.label);
                          } else {
                            next = [...prev, slot.label].sort((a, b) => {
                              return generatedSlots.findIndex((s) => s.label === a) - generatedSlots.findIndex((s) => s.label === b);
                            });
                          }
                          // Reset selected turf if it's no longer available for the new time combination
                          if (selectedTurf) {
                            const turf = turfsList.find((t: any) => t.id === selectedTurf);
                            const turfStillAvailable = next.every(time => {
                              const s = turf?.slots?.find((slotObj: any) => slotObj.time === time);
                              return s ? s.available : true;
                            });
                            if (!turfStillAvailable) setSelectedTurf(null);
                          }
                          return next;
                        });
                      }}
                      className={`py-3 px-2 rounded-play-md text-sm transition-all flex flex-col items-center justify-center gap-1 select-none ${
                        !isAvailableGlobally
                          ? 'bg-play-surface-subtle/80 text-play-text-light border border-dashed border-play-border cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-play-brand text-white font-black border border-play-brand shadow-play-sm scale-[0.98]'
                          : 'bg-play-surface border border-play-border hover:border-play-brand hover:bg-play-brand-light/20 text-play-text cursor-pointer hover:shadow-play-sm'
                      }`}
                    >
                      <span className="font-bold flex flex-col items-center gap-0.5 text-center">
                        {isSelected && <Check size={14} className="stroke-[3]" />}
                        <span className="text-sm">{slot.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-emerald-100/80' : 'text-play-text-muted'} font-normal`}>
                          to {formatIST(slot.endTime, 'h:mm a')}
                        </span>
                      </span>
                      {!isAvailableGlobally && (
                        <span className="text-[10px] font-semibold line-through opacity-70">
                          Booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Court Selector (Only shown when times are selected) */}
            {selectedSlots.length > 0 ? (
              <div className="bg-play-surface border border-play-border rounded-play-xl p-4 shadow-play-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-play-text-muted">
                    <ShieldCheck size={14} className="text-play-brand" />
                    <span>Available Courts for Selected Time</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {turfsList.map((turf: any) => {
                    const isAvailableForSelectedTimes = selectedSlots.every(slotLabel => {
                      const s = turf.slots?.find((slotObj: any) => slotObj.time === slotLabel);
                      return s ? s.available : true;
                    });
                    
                    if (!isAvailableForSelectedTimes) return null;

                    const isThisTurfActive = selectedTurf === turf.id;
                    const turfTotalPrice = Math.round(selectedSlots.reduce((sum, slotLabel) => {
                      const s = turf.slots?.find((slotObj: any) => slotObj.time === slotLabel);
                      return sum + (s?.price ?? turf.bookingPrice ?? 0);
                    }, 0));

                    return (
                      <button
                        key={turf.id}
                        type="button"
                        onClick={() => setSelectedTurf(turf.id)}
                        className={`flex flex-col p-4 rounded-play-lg border transition-all cursor-pointer text-left ${
                          isThisTurfActive
                            ? 'bg-play-brand/5 border-play-brand shadow-play-sm ring-1 ring-play-brand'
                            : 'bg-play-surface border-play-border hover:border-play-brand/40 hover:bg-play-surface-subtle'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <div>
                            <span className={`font-black text-base block ${isThisTurfActive ? 'text-play-brand-dark' : 'text-play-text'}`}>
                              {turf.name}
                            </span>
                            <span className="text-xs text-play-text-muted mt-1 block">
                              {turf.location || 'Arena'}
                            </span>
                          </div>
                          {isThisTurfActive && <CheckCircle2 size={20} className="text-play-brand" />}
                        </div>
                        <div className="mt-4 pt-3 border-t border-play-border/50 w-full flex justify-between items-center">
                          <span className="text-xs font-semibold text-play-text-muted">Total Price</span>
                          <span className="font-bold text-lg text-play-brand-dark">₹{turfTotalPrice}</span>
                        </div>
                      </button>
                    );
                  })}
                  
                  {turfsList.every((turf: any) => !selectedSlots.every(slotLabel => {
                      const s = turf.slots?.find((slotObj: any) => slotObj.time === slotLabel);
                      return s ? s.available : true;
                  })) && (
                    <div className="col-span-full py-8 text-center bg-play-surface-subtle rounded-play-lg border border-dashed border-play-border">
                      <p className="text-play-text-muted text-sm font-semibold">
                        No courts are available for all the selected time slots.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-play-surface-subtle border border-play-border border-dashed rounded-play-xl p-8 text-center animate-in fade-in">
                <Clock size={32} className="mx-auto text-play-text-light mb-3" />
                <h3 className="font-bold text-play-text mb-1">Select Time Slots</h3>
                <p className="text-sm text-play-text-muted max-w-sm mx-auto">
                  Please pick one or more time slots above to see the courts available for your game.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Bottom Booking Summary Bar */}
      {selectedSlots.length > 0 && selectedTurf && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 bg-play-surface border-t border-play-border shadow-[0_-8px_20px_rgba(0,0,0,0.08)] py-3 px-4 sm:px-6 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-11 h-11 rounded-play-md bg-play-brand-light flex items-center justify-center text-play-brand-dark shrink-0">
                {activeSport?.iconPath ? (
                  activeSport.iconPath.includes('.') ? (
                    <img src={activeSport.iconPath} alt={activeSport.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="text-2xl">{activeSport.iconPath}</span>
                  )
                ) : (
                  <Sparkles size={22} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-play-text">
                    {selectedTurfDetails?.name || 'Selected Court'}
                  </span>
                  <PlayBadge variant="brand" size="sm">
                    {selectedSlots.length} {selectedSlots.length === 1 ? 'Slot' : 'Slots'}
                  </PlayBadge>
                </div>
                <p className="text-xs text-play-text-muted mt-0.5">
                  {(() => {
                    const selectedObjects = generatedSlots.filter((s) => selectedSlots.includes(s.label));
                    if (selectedObjects.length === 0) return '';
                    const start = selectedObjects[0].label;
                    const end = formatIST(selectedObjects[selectedObjects.length - 1].endTime, 'h:mm a');
                    return `${start} to ${end}`;
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right sm:text-right">
                <span className="block text-[11px] font-semibold text-play-text-muted uppercase">
                  Total Payable
                </span>
                <span className="text-2xl font-black text-play-text tracking-tight">
                  ₹{totalPrice}
                </span>
              </div>

              <PlayButton
                variant="athletic"
                size="lg"
                onClick={() => setIsCheckoutOpen(true)}
                className="min-w-[180px] shadow-play-md"
                rightIcon={<ChevronRight size={18} />}
              >
                Continue to Checkout
              </PlayButton>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Bottom Sheet / Dialog Modal */}
      {isCheckoutOpen && (
        <PlayModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          size="lg"
          noPadding
          title="Review & Confirm Booking"
          description="Verify court details and select your preferred payment mode."
        >
          <ReviewPanel
            selectedSlots={selectedSlots}
            timeDisplayOverride={(() => {
              const selectedObjects = generatedSlots.filter((s) => selectedSlots.includes(s.label));
              if (selectedObjects.length === 0) return '--:--';
              const start = formatIST(selectedObjects[0].startTime, 'h:mm a');
              const end = formatIST(selectedObjects[selectedObjects.length - 1].endTime, 'h:mm a');
              return `${start} - ${end}`;
            })()}
            selectedTurf={selectedTurfDetails?.name || selectedTurf || ''}
            price={totalPrice}
            walletBalance={(member?.walletBalance || 0) / 100}
            pointsBalance={member?.loyaltyPoints || 0}
            onApplyCoupon={() => {}}
            onRedeemPoints={() => {}}
            onClose={() => setIsCheckoutOpen(false)}
            onConfirm={handleConfirmBooking}
            createBooking={async () => {
              const { startDateTime, endDateTime } = calculateSlotTimes();
              const targetTurfId = selectedTurf || availability?.turfs?.[0]?.id;
              const res = await fetch('/api/client/v1/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  memberId: member.id,
                  turfId: targetTurfId,
                  sportId: selectedSportId,
                  startTime: startDateTime.toISOString(),
                  endTime: endDateTime.toISOString(),
                  participantCount: 1,
                  walletAmountToUse: 0,
                  pointsAmountToUse: 0,
                }),
              });
              const data = await res.json();
              if (!res.ok || !data.booking) {
                throw new Error(data.error || 'Failed to initialize booking');
              }
              return data.booking.id;
            }}
          />
        </PlayModal>
      )}

      {/* Booking Celebration Modal */}
      {confirmedBookingId && (
        <PlayModal
          isOpen={!!confirmedBookingId}
          onClose={() => {
            router.push(`/play/bookings/${confirmedBookingId}`);
          }}
          size="md"
        >
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-18 h-18 rounded-full bg-play-brand-light flex items-center justify-center text-play-brand mb-4 ring-8 ring-play-brand-light/50 animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <PlayBadge variant="success" size="md" className="mb-3">
              Booking Confirmed! 🎉
            </PlayBadge>

            <h2 className="text-2xl sm:text-3xl font-black text-play-text mb-2">
              You're Ready to Play!
            </h2>

            <p className="text-sm text-play-text-muted max-w-sm mb-6">
              Your court has been reserved at{' '}
              <strong className="text-play-text">{selectedTurfDetails?.name}</strong> for{' '}
              <strong className="text-play-text">{formatIST(selectedDate, 'EEEE, MMM d')}</strong>.
            </p>

            <div className="w-full bg-play-surface-subtle border border-play-border rounded-play-lg p-4 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-play-text-muted">Booking Reference:</span>
                <span className="font-mono font-bold text-play-text">{confirmedBookingId.slice(0, 10)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-play-text-muted">Sport:</span>
                <span className="font-bold text-play-text">{activeSport?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-play-text-muted">Total Paid:</span>
                <span className="font-bold text-play-brand-dark">₹{totalPrice}</span>
              </div>
            </div>

            <PlayButton
              variant="athletic"
              size="lg"
              fullWidth
              onClick={() => {
                router.push(`/play/bookings/${confirmedBookingId}`);
              }}
            >
              View Digital Ticket & QR
            </PlayButton>
          </div>
        </PlayModal>
      )}

      {/* Sport Picker Modal */}
      {isSportDrawerOpen && (
        <PlayModal
          isOpen={isSportDrawerOpen}
          onClose={() => setIsSportDrawerOpen(false)}
          size="sm"
          title="Select a Sport"
          description="Choose a sport to see available courts"
        >
          <div className="grid grid-cols-2 gap-3 mt-4">
            {sports.map((sport: any) => {
              const isSelected = sport.id === selectedSportId;
              return (
                <button
                  key={sport.id}
                  onClick={() => {
                    handleSportChange(sport.id);
                    setIsSportDrawerOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-play-lg border transition-all ${
                    isSelected
                      ? 'bg-play-brand/10 border-play-brand text-play-brand-dark shadow-play-sm'
                      : 'bg-play-surface border-play-border hover:border-play-brand/50 hover:bg-play-surface-hover text-play-text'
                  }`}
                >
                  {sport.iconPath ? (
                    sport.iconPath.includes('.') ? (
                      <img src={sport.iconPath} alt={sport.name} className="w-10 h-10 object-contain mb-2" />
                    ) : (
                      <span className="text-3xl mb-2">{sport.iconPath}</span>
                    )
                  ) : (
                    <span className="text-3xl mb-2">🎾</span>
                  )}
                  <span className="font-bold text-sm text-center">{sport.name}</span>
                </button>
              );
            })}
          </div>
        </PlayModal>
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

