"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getKioskFacilities, fetchKioskAvailableSlots, createKioskBooking } from "./actions";
import { formatIST, todayIST } from "@/lib/dateUtils";
import { FiCheckCircle, FiClock, FiCreditCard, FiSmartphone } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";
import { playNfcSound } from "@/lib/soundUtils";

function generateSlots(dateStr: string, durationMin: number, openTime: string, closeTime: string) {
  const slots = [];
  const start = new Date(dateStr);
  const [openHour, openMin] = openTime.split(':').map(Number);
  start.setHours(openHour, openMin, 0, 0);
  
  const end = new Date(dateStr);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  end.setHours(closeHour, closeMin, 0, 0);

  if (end <= start) end.setDate(end.getDate() + 1);
  
  const now = new Date(); // Don't allow booking in the past
  let current = new Date(start);
  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMin * 60000);
    if (slotEnd > end) break;
    if (current > now) {
      slots.push({
        startTime: new Date(current),
        endTime: slotEnd,
        label: formatIST(current, 'h:mm a')
      });
    }
    current = slotEnd;
  }
  return slots;
}

export default function KioskBookingFlow({ member, onComplete, onCancel }: { member: any, onComplete: () => void, onCancel: () => void }) {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [turfs, setTurfs] = useState<any[]>([]);
  const [hours, setHours] = useState({ openTime: "06:00", closeTime: "23:00" });
  
  const [selectedSport, setSelectedSport] = useState<any>(null);
  const [selectedTurf, setSelectedTurf] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    getKioskFacilities().then((data) => {
      setTurfs(data.turfs);
      setHours({ openTime: data.openTime, closeTime: data.closeTime });
      setLoading(false);
    });
  }, []);

  const sports = useMemo(() => {
    const map = new Map();
    turfs.forEach(t => {
      if(t.sports) t.sports.forEach((ts: any) => map.set(ts.sport.id, ts.sport));
    });
    return Array.from(map.values());
  }, [turfs]);

  // Load slot availability when turf is selected
  useEffect(() => {
    if (selectedTurf) {
      fetchKioskAvailableSlots(selectedTurf.id, 60).then(bookings => {
        const allSlots = generateSlots(todayIST(), 60, hours.openTime, hours.closeTime);
        const freeSlots = allSlots.filter(slot => {
          return !bookings.some((b: any) => 
            new Date(b.startTime) < slot.endTime && new Date(b.endTime) > slot.startTime
          );
        });
        setAvailableSlots(freeSlots);
      });
    }
  }, [selectedTurf, hours]);

  const handleWalletPayment = async () => {
    if (member.walletBalanceRupees < selectedTurf.pricePerHour) {
      showAlert("Insufficient Balance", "Your wallet balance is lower than the booking price.", "error");
      return;
    }

    setIsProcessing(true);
    try {
      await createKioskBooking({
        memberId: member.id,
        turfId: selectedTurf.id,
        sportId: selectedSport.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        price: selectedTurf.pricePerHour,
        paymentMethod: "WALLET"
      });
      playNfcSound("success");
      showAlert("Success", "Booking created successfully and you are checked in!", "success");
      onComplete();
    } catch (err: any) {
      showAlert("Error", err.message, "error");
      setIsProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create the booking as PAYMENT_PENDING and get Razorpay order
      const res = await createKioskBooking({
        memberId: member.id,
        turfId: selectedTurf.id,
        sportId: selectedSport.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        price: selectedTurf.pricePerHour,
        paymentMethod: "RAZORPAY"
      });

      if (!res.success || !res.orderData) throw new Error("Could not initialize booking");

      const options = {
        key: res.orderData.keyId,
        amount: Number(res.orderData.amount || 0) * 100,
        currency: "INR",
        name: "SportsVilla Kiosk",
        description: `Booking ${selectedSport.name} at ${selectedTurf.name}`,
        order_id: res.orderData.orderId,
        handler: async function (response: any) {
          try {
            const { confirmKioskRazorpayPayment } = await import("./actions");
            await confirmKioskRazorpayPayment(
              res.booking.id,
              member.id,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            playNfcSound("success");
            showAlert("Success", "Payment successful and you are checked in!", "success");
            onComplete();
          } catch (err: any) {
            showAlert("Error", "Payment verification failed: " + err.message, "error");
          }
        },
        prefill: {
          name: member.name,
          contact: member.mobile || "",
        },
        theme: {
          color: "#ea580c",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showAlert("Error", err.message, "error");
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-white">Loading Facilities...</div>;

  return (
    <div className="bg-[#1c1f2e] rounded-2xl p-6 shadow-2xl border border-[#2a2d3e] flex flex-col gap-6 animate-in slide-in-from-bottom-8 fade-in">
      <div className="flex justify-between items-center border-b border-[#2a2d3e] pb-4">
        <h2 className="text-2xl font-bold text-white">Book Court for Today</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white px-4 py-2 rounded bg-[#25293d]">Cancel</button>
      </div>

      {!selectedSport && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sports.map(s => (
            <button key={s.id} onClick={() => setSelectedSport(s)} className="p-4 bg-[#161824] border border-[#34384e] rounded-xl hover:border-orange-500 text-white font-bold text-lg">
              {s.name}
            </button>
          ))}
        </div>
      )}

      {selectedSport && !selectedTurf && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {turfs.filter(t => t.sports.some((ts: any) => ts.sportId === selectedSport.id)).map(t => (
            <button key={t.id} onClick={() => setSelectedTurf(t)} className="p-4 bg-[#161824] border border-[#34384e] rounded-xl hover:border-orange-500 text-left">
              <h3 className="text-xl font-bold text-white">{t.name}</h3>
              <p className="text-orange-400 font-semibold mt-1">₹{t.pricePerHour} / hour</p>
            </button>
          ))}
        </div>
      )}

      {selectedTurf && !selectedSlot && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Select Available Slot ({selectedTurf.name})</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {availableSlots.length === 0 ? (
              <p className="col-span-full text-slate-400">No slots available today.</p>
            ) : (
              availableSlots.map((slot, i) => (
                <button key={i} onClick={() => setSelectedSlot(slot)} className="p-2 text-sm bg-[#161824] border border-[#34384e] text-white rounded hover:bg-orange-500 hover:border-orange-500 transition">
                  {slot.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {selectedSlot && (
        <div className="bg-[#161824] border border-[#34384e] p-6 rounded-xl flex flex-col items-center text-center">
          <h3 className="text-2xl font-black text-white mb-2">{selectedSport.name} at {selectedTurf.name}</h3>
          <p className="text-orange-400 text-lg mb-6 flex items-center justify-center gap-2"><FiClock /> Today, {selectedSlot.label} (1 Hour)</p>
          <div className="text-3xl font-black text-white mb-8">₹{selectedTurf.pricePerHour}</div>
          
          <div className="flex gap-4 w-full">
            <button 
              disabled={isProcessing}
              onClick={handleWalletPayment}
              className="flex-1 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 bg-[#25293d] border border-[#34384e] text-white hover:bg-[#2c3149] disabled:opacity-50"
            >
              <FiCreditCard className="text-2xl text-emerald-400" />
              Pay from Wallet
              <span className="text-xs font-normal text-slate-400">Balance: ₹{member.walletBalanceRupees}</span>
            </button>
            <button 
              disabled={isProcessing}
              onClick={handleRazorpayPayment}
              className="flex-1 p-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 bg-orange-600 text-white hover:bg-orange-500 disabled:opacity-50"
            >
              <FiSmartphone className="text-2xl" />
              Pay with UPI / QR
              <span className="text-xs font-normal text-orange-200">Scan via PhonePe/GPay</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
