"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchBookingsByDate, createBooking, searchMember, getUpiId, addPayment, updateDisplaySession } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import QRCodeLib from "qrcode";
import { formatIST } from "../../lib/dateUtils";
import { FiCalendar, FiClock, FiCheck, FiX, FiUser, FiCreditCard, FiMapPin, FiList, FiPlus } from "react-icons/fi";
import ManageBookings from "./ManageBookings";

// Generate slots based on duration and facility open/close time
function generateSlots(dateStr: string, durationMin: number, openTime: string = "06:00", closeTime: string = "23:00") {
  const slots = [];
  const start = new Date(dateStr);
  const [openHour, openMin] = openTime.split(':').map(Number);
  start.setHours(openHour, openMin, 0, 0);
  
  const end = new Date(dateStr);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  end.setHours(closeHour, closeMin, 0, 0);

  if (end <= start) {
    end.setDate(end.getDate() + 1); // Handle cross-midnight closing times
  }
  
  let current = new Date(start);
  while (current < end) {
    const slotEnd = new Date(current.getTime() + durationMin * 60000);
    if (slotEnd > end) break; // Don't generate slots that go past closing time
    slots.push({
      startTime: new Date(current),
      endTime: slotEnd,
      label: formatIST(current, 'h:mm a')
    });
    current = slotEnd;
  }
  return slots;
}

export default function BookingsClient({ turfs, facilityHours = { openTime: '06:00', closeTime: '23:00' }, pointsPerRupee = 100 }: { turfs: any[], facilityHours?: { openTime: string, closeTime: string }, pointsPerRupee?: number }) {
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState<'NEW' | 'MANAGE'>('MANAGE');
  
  // Extract unique sports from turfs
  const sports = useMemo(() => {
    const map = new Map();
    turfs.forEach(t => {
      if(t.sports) t.sports.forEach((ts: any) => map.set(ts.sport.id, ts.sport));
    });
    return Array.from(map.values());
  }, [turfs]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSportId, setSelectedSportId] = useState<string>(sports.length > 0 ? sports[0].id : "");
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selection State
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const [selectedTurfs, setSelectedTurfs] = useState<any[]>([]);
  
  // Booking Modal
  const [showModal, setShowModal] = useState(false);
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [additionalMemberIds, setAdditionalMemberIds] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // Payment State
  const [qrCodeData, setQrCodeData] = useState("");
  const [upiSettings, setUpiSettings] = useState({ upiId: "", businessName: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashAmount, setCashAmount] = useState<number | "">(0);
  const [onlineAmount, setOnlineAmount] = useState<number | "">(0);
  const [participantCount, setParticipantCount] = useState<number | "">(1);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [redeemPoints, setRedeemPoints] = useState(false);

  useEffect(() => {
    if (activeTab === 'NEW') {
      loadBookings();
    }
  }, [selectedDate, activeTab]);

  useEffect(() => {
    // Reset selection if sport changes
    setSelectedSlots([]);
    setSelectedTurfs([]);
  }, [selectedSportId]);

  useEffect(() => {
    getUpiId().then(setUpiSettings);
  }, []);

  async function loadBookings() {
    setLoading(true);
    const data = await fetchBookingsByDate(selectedDate);
    setBookings(data);
    setSelectedSlots([]);
    setSelectedTurfs([]);
    setCashAmount(0);
    setOnlineAmount(0);
    setLoading(false);
  }

  async function handleMobileSearch(val: string) {
    setMobile(val);
    setMemberId("");
    setName("");
    setAdditionalMemberIds([]);
    if (val.length === 10) {
      const results = await searchMember(val);
      setSearchResults(results);
      if (results.length === 1) {
        setMemberId(results[0].id);
        setName(results[0].name);
      }
    } else {
      setSearchResults([]);
    }
  }

  function toggleSlot(slot: any) {
    const exists = selectedSlots.find(s => s.startTime.getTime() === slot.startTime.getTime());
    if (exists) {
      setSelectedSlots(selectedSlots.filter(s => s.startTime.getTime() !== slot.startTime.getTime()));
    } else {
      setSelectedSlots([...selectedSlots, slot].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()));
    }
  }

  // Find turfs that support the selected sport
  const applicableTurfs = useMemo(() => {
    if (!selectedSportId) return [];
    return turfs.filter(t => t.sports?.some((ts: any) => ts.sport.id === selectedSportId));
  }, [turfs, selectedSportId]);

  // Use 30 minutes as standard slot size
  const slotDuration = 30;
  const slots = useMemo(() => generateSlots(selectedDate, slotDuration, facilityHours?.openTime, facilityHours?.closeTime), [selectedDate, slotDuration, facilityHours]);

  // Calculate court availability based on selected slots
  const turfAvailability = useMemo(() => {
    if (selectedSlots.length === 0) return [];
    
    return applicableTurfs.map(turf => {
      // Find the max booked participants across all selected slots
      let maxBooked = 0;
      selectedSlots.forEach(slot => {
        const bookedInSlot = bookings.reduce((sum, b) => {
          if (b.turfId !== turf.id || b.status === "CANCELLED") return sum;
          const slotStart = slot.startTime.getTime();
          const slotEnd = slot.endTime.getTime();
          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          if (slotStart < bEnd && slotEnd > bStart) {
            return sum + (b.participantCount || 1);
          }
          return sum;
        }, 0);
        if (bookedInSlot > maxBooked) maxBooked = bookedInSlot;
      });
      
      const capacity = turf.capacityPerSlot || 1;
      const remainingCapacity = Math.max(0, capacity - maxBooked);
      // It is booked if remainingCapacity is 0
      const isBooked = remainingCapacity <= 0;
      return { turf, isBooked, remainingCapacity };
    });
  }, [applicableTurfs, selectedSlots, bookings]);

  // Ensure selected turfs are deselected if they become unavailable
  useEffect(() => {
    if (selectedTurfs.length > 0) {
      const validTurfs = selectedTurfs.filter(st => {
        const currentStatus = turfAvailability.find(ta => ta.turf.id === st.id);
        // A turf is valid if it exists in turfAvailability and is NOT booked
        return currentStatus && !currentStatus.isBooked;
      });
      if (validTurfs.length !== selectedTurfs.length) {
        setSelectedTurfs(validTurfs);
      }
    }
  }, [turfAvailability, selectedTurfs, selectedSlots]);

  // Overall slot status (for UI display)
  // A slot is "Available" if AT LEAST ONE applicable turf is free during it
  function getSlotStatus(slot: any) {
    if (applicableTurfs.length === 0) return 'UNAVAILABLE';
    
    const isSelected = selectedSlots.find(s => s.startTime.getTime() === slot.startTime.getTime());
    if (isSelected) return 'SELECTED';

    // Are all applicable turfs booked for this slot?
    const allBooked = applicableTurfs.every(turf => {
      const capacity = turf.capacityPerSlot || 1;
      const bookedInSlot = bookings.reduce((sum, b) => {
        if (b.turfId !== turf.id || b.status === "CANCELLED") return sum;
        const slotStart = slot.startTime.getTime();
        const slotEnd = slot.endTime.getTime();
        const bStart = new Date(b.startTime).getTime();
        const bEnd = new Date(b.endTime).getTime();
        if (slotStart < bEnd && slotEnd > bStart) {
          return sum + (b.participantCount || 1);
        }
        return sum;
      }, 0);
      return bookedInSlot >= capacity;
    });

    if (allBooked) return 'BOOKED';
    return 'AVAILABLE';
  }

  async function openCheckout() {
    if (selectedSlots.length === 0) return showAlert("Select Slots", "Please select at least one time slot.", "error");
    if (selectedTurfs.length === 0) return showAlert("Select Court", "Please select an available court.", "error");
    
    setShowModal(true);
    setParticipantCount(1);
    setGuestNames([]);
    setAdditionalMemberIds([]);
    
    const totalTurfPricePer30m = selectedTurfs.reduce((sum, t) => sum + ((t.bookingPrice || 0) / (t.bookingDurationMinutes || 60) * 30), 0);
    const totalAmount = selectedSlots.length * totalTurfPricePer30m;
    if (upiSettings.upiId && totalAmount > 0) {
      const upiUrl = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.businessName)}&am=${totalAmount}&cu=INR`;
      const qrUrl = await QRCodeLib.toDataURL(upiUrl, { width: 300, margin: 1 });
      setQrCodeData(qrUrl);
    }
  }

  const totalTurfPricePer30m = selectedTurfs.reduce((sum, t) => sum + ((t.bookingPrice || 0) / (t.bookingDurationMinutes || 60) * 30), 0);
  const totalPrice = selectedSlots.length * totalTurfPricePer30m * (Number(participantCount) || 1);

  const primaryMember = searchResults.find(m => m.id === memberId) || (searchResults.length === 1 && searchResults[0].mobile === mobile ? searchResults[0] : null);
  const maxDiscount = primaryMember ? Math.floor((primaryMember.loyaltyPoints || 0) / (pointsPerRupee || 100)) : 0;
  const applicableDiscount = redeemPoints ? Math.min(totalPrice, maxDiscount) : 0;
  const finalPrice = totalPrice - applicableDiscount;

  useEffect(() => {
    if (!showModal || !upiSettings.upiId) return;

    const generateDynamicQR = async () => {
      const amountForQR = (Number(onlineAmount) || 0) > 0 
        ? (Number(onlineAmount) || 0) 
        : Math.max(0, finalPrice - (Number(cashAmount) || 0));

      if (amountForQR > 0) {
        const upiUrl = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.businessName)}&am=${amountForQR}&cu=INR`;
        const qrUrl = await QRCodeLib.toDataURL(upiUrl, { width: 300, margin: 1 });
        setQrCodeData(qrUrl);
      } else {
        setQrCodeData("");
      }
    };

    generateDynamicQR();
  }, [cashAmount, onlineAmount, showModal, upiSettings, finalPrice]);

  async function confirmBooking() {
    if (!mobile && !memberId) return showAlert("Missing Details", "Please provide a mobile number.", "error");
    if (searchResults.length === 0 && !name) return showAlert("Missing Name", "This is a new member, please enter their full name.", "error");
    if (searchResults.length > 1 && !memberId) return showAlert("Select Member", "Multiple family members found. Please select one.", "error");
    
    setIsProcessing(true);
    try {
      const familyGuestNames = additionalMemberIds.map(id => searchResults.find(r => r.id === id)?.name || "");
      const finalGuestNames = [...familyGuestNames, ...guestNames.slice(0, (Number(participantCount) || 1) - 1 - familyGuestNames.length)];

      const createdBookings = await createBooking({
        turfIds: selectedTurfs.map(t => t.id),
        sportId: selectedSportId,
        slots: selectedSlots,
        memberId: memberId || undefined,
        mobile: !memberId ? mobile : undefined,
        name: !memberId ? name : undefined,
        participantCount: Number(participantCount) || 1,
        guestNames: finalGuestNames,
        additionalMemberIds: additionalMemberIds,
        redeemPoints: redeemPoints
      });
      
      if (createdBookings && createdBookings.length > 0) {
        // Apply payments to the first booking for simplicity if split across multiple
        const primaryBookingId = createdBookings[0].id;
        if ((Number(cashAmount) || 0) > 0) await addPayment(primaryBookingId, Number(cashAmount) || 0, "CASH");
        if ((Number(onlineAmount) || 0) > 0) await addPayment(primaryBookingId, Number(onlineAmount) || 0, "ONLINE");

        // If cast to screen was active and we're fully paid, trigger success
        if ((Number(cashAmount) || 0) + (Number(onlineAmount) || 0) >= finalPrice) {
          await updateDisplaySession({
            status: "PAID",
            memberName: name || "Member"
          });
        } else {
          await updateDisplaySession({ status: "IDLE" });
        }
      }
      
      showAlert("Booking Confirmed", `Successfully booked ${selectedSlots.length} slots for ${name || 'Member'}!`, "success", {
        actions: [{ label: "Print Tickets", onClick: () => window.open(`/print/ticket/${createdBookings[0].id}`, "_blank") }]
      });
      setShowModal(false);
      loadBookings();
    } catch (err: any) {
      showAlert("Booking Failed", err.message || "Failed to confirm booking.", "error");
    }
    setIsProcessing(false);
  }

  async function handleCastToDisplay() {
    const amountForDisplay = (Number(onlineAmount) || 0) > 0 
      ? (Number(onlineAmount) || 0) 
      : Math.max(0, finalPrice - (Number(cashAmount) || 0));

    await updateDisplaySession({
      status: "AWAITING_PAYMENT",
      amount: amountForDisplay,
      memberName: name || "Member",
      qrData: qrCodeData
    });
    showAlert("Cast to Screen", "Successfully updated the Customer Facing Display.", "success");
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-8 border-b border-[#2a2d3e] pb-4">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('MANAGE')}
            className={`px-4 py-2 font-bold text-sm tracking-wide transition-colors ${activeTab === 'MANAGE' ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}
          >
            <div className="flex items-center gap-2"><FiList /> Manage Bookings</div>
          </button>
          <button 
            onClick={() => setActiveTab('NEW')}
            className={`px-4 py-2 font-bold text-sm tracking-wide transition-colors ${activeTab === 'NEW' ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-white'}`}
          >
            <div className="flex items-center gap-2"><FiPlus /> New Booking</div>
          </button>
        </div>
      </div>

      {activeTab === 'MANAGE' ? (
        <ManageBookings />
      ) : (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-['Outfit'] text-white">Create New Booking</h1>
            <p className="text-gray-500 mt-1 text-sm">Select Sport ➔ Select Slots ➔ Pick Court</p>
          </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">1. Select Date</label>
            <input 
              type="date" 
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-orange-500/50 focus:outline-none"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">2. Select Sport</label>
            <div className="flex flex-col gap-2">
              {sports.map((sport: any) => (
                <button 
                  key={sport.id}
                  onClick={() => setSelectedSportId(sport.id)}
                  className={`px-4 py-3 rounded-lg text-left transition-colors border font-semibold ${selectedSportId === sport.id ? 'bg-[#1c1f2e] border-orange-500/50 text-white' : 'bg-[#0f1117] border-[#2a2d3e] text-gray-400 hover:border-gray-500'}`}
                >
                  {sport.name}
                </button>
              ))}
              {sports.length === 0 && <div className="text-gray-500 text-sm">No sports configured with turfs.</div>}
            </div>
          </div>

          {selectedSlots.length > 0 && selectedTurfs.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 border-t border-[#2a2d3e] bg-[#161923] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:relative lg:p-5 lg:border lg:border-orange-500/20 lg:bg-orange-500/10 lg:shadow-none lg:rounded-xl">
              <h3 className="font-bold text-orange-400 mb-2 hidden lg:block">Booking Summary</h3>
              
              <div className="flex justify-between items-center lg:hidden">
                <div className="flex flex-col">
                  <div className="text-xs text-gray-400">{selectedSlots.length} Slots Selected</div>
                  <div className="text-xl font-bold text-white">₹{Number(totalPrice.toFixed(2))}</div>
                </div>
                <button 
                  onClick={openCheckout}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-3 font-semibold transition-colors border-none cursor-pointer"
                >
                  Checkout
                </button>
              </div>

              {/* Desktop version */}
              <div className="hidden lg:block">
                <div className="text-sm text-white mb-1">{selectedTurfs.map(t => t.name).join(", ")}</div>
                <div className="font-semibold text-lg text-emerald-400">
                  {formatIST(new Date(Math.min(...selectedSlots.map(s => s.startTime.getTime()))), 'h:mm a')} 
                  <span className="text-gray-500 mx-2">to</span> 
                  {formatIST(new Date(Math.max(...selectedSlots.map(s => s.endTime.getTime()))), 'h:mm a')}
                </div>
                <div className="text-xs text-gray-400 mb-1">{selectedSlots.length} Slots Selected</div>
                <div className="text-2xl font-bold text-white mb-4">₹{Number(totalPrice.toFixed(2))}</div>
                <button 
                  onClick={openCheckout}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-3 font-semibold transition-colors border-none cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6">
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : selectedSportId ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-['Outfit'] text-white flex items-center gap-2">
                    <FiClock className="text-orange-500" /> 3. Select Time Slots
                  </h2>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-gray-500"><div className="w-3 h-3 rounded bg-[#0f1117] border border-[#2a2d3e]"></div> Available</div>
                    <div className="flex items-center gap-1.5 text-gray-500"><div className="w-3 h-3 rounded bg-orange-500 border border-orange-600"></div> Selected</div>
                    <div className="flex items-center gap-1.5 text-gray-500"><div className="w-3 h-3 rounded bg-[#1c1f2e] opacity-50 border border-red-500/30"></div> Fully Booked</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {slots.map((slot, i) => {
                    const status = getSlotStatus(slot);
                    return (
                      <button
                        key={i}
                        onClick={() => status !== 'BOOKED' && toggleSlot(slot)}
                        disabled={status === 'BOOKED'}
                        className={`
                          p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer
                          ${status === 'AVAILABLE' ? 'bg-[#0f1117] border-[#2a2d3e] text-gray-300 hover:border-orange-500/50' : ''}
                          ${status === 'SELECTED' ? 'bg-orange-500 border-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}
                          ${status === 'BOOKED' ? 'bg-[#1c1f2e] border-red-500/20 text-gray-600 opacity-50 cursor-not-allowed' : ''}
                          ${status === 'UNAVAILABLE' ? 'bg-[#0f1117] border-[#2a2d3e] text-gray-600 opacity-40 cursor-not-allowed' : ''}
                        `}
                      >
                        <span className="font-semibold text-sm">{slot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                Please select a sport first.
              </div>
            )}
          </div>

          {selectedSlots.length > 0 && (
            <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-6 animate-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-xl font-bold font-['Outfit'] text-white flex items-center gap-2 mb-6">
                <FiMapPin className="text-emerald-500" /> 4. Select Available Court
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {turfAvailability.map((ta) => (
                  <button
                    key={ta.turf.id}
                    onClick={() => {
                      if (!ta.isBooked) {
                        if (selectedTurfs.find(t => t.id === ta.turf.id)) {
                          setSelectedTurfs(selectedTurfs.filter(t => t.id !== ta.turf.id));
                        } else {
                          setSelectedTurfs([...selectedTurfs, ta.turf]);
                        }
                      }
                    }}
                    disabled={ta.isBooked}
                    className={`
                      text-left p-4 rounded-xl border transition-all relative overflow-hidden
                      ${ta.isBooked 
                        ? 'bg-[#0f1117] border-red-500/20 opacity-60 cursor-not-allowed' 
                        : selectedTurfs.some(t => t.id === ta.turf.id)
                          ? 'bg-[#1c1f2e] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer'
                          : 'bg-[#0f1117] border-[#2a2d3e] hover:border-emerald-500/50 cursor-pointer'
                      }
                    `}
                  >
                    <div className="font-bold text-white text-lg mb-1">{ta.turf.name}</div>
                    <div className="text-sm text-gray-400">₹{ta.turf.bookingPrice} / {ta.turf.bookingDurationMinutes}m</div>
                    {ta.turf.capacityPerSlot > 1 && !ta.isBooked && (
                      <div className="mt-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 inline-block px-2 py-1 rounded-md">
                        {ta.remainingCapacity} Spots Left
                      </div>
                    )}
                    {ta.isBooked && (
                      <div className="absolute top-4 right-4 text-xs font-black tracking-widest text-red-500 bg-red-500/10 px-2 py-1 rounded">
                        UNAVAILABLE
                      </div>
                    )}
                    {!ta.isBooked && selectedTurfs.some(t => t.id === ta.turf.id) && (
                      <div className="absolute top-4 right-4 text-emerald-500 text-xl">
                        <FiCheck />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-24 lg:hidden"></div> {/* padding for sticky bottom bar */}
      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161923] md:border md:border-[#2a2d3e] rounded-t-2xl md:rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh] md:max-h-[90vh] animate-[slideUp_0.3s_ease-out] md:animate-none relative">
            
            {/* Left: Customer Details */}
            <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#2a2d3e] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-['Outfit'] text-white">Customer Details</h2>
                <button className="md:hidden text-gray-500 hover:text-white" onClick={() => {
                  updateDisplaySession({ status: "IDLE" }).catch(() => {});
                  setShowModal(false);
                }}><FiX size={24} /></button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                    placeholder="Enter 10-digit mobile"
                    value={mobile}
                    onChange={e => handleMobileSearch(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                  />
                </div>

                {selectedTurfs.some(t => t.requireEntryVerification || t.capacityPerSlot > 1) && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Number of Persons</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={participantCount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setParticipantCount(val === '' ? '' : parseInt(val, 10));
                      }}
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>
                )}

                {searchResults.length > 1 && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Select Family Members</label>
                    <div className="space-y-2">
                      {searchResults.map(m => {
                        const isPrimary = memberId === m.id;
                        const isAdditional = additionalMemberIds.includes(m.id);
                        const isSelected = isPrimary || isAdditional;

                        return (
                          <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'bg-[#1c1f2e] border-emerald-500 text-white' : 'border-[#2a2d3e] text-gray-400 hover:bg-[#1c1f2e]'}`}>
                            <input 
                              type="checkbox" 
                              checked={isSelected} 
                              onChange={() => {
                                if (isPrimary) {
                                  if (additionalMemberIds.length > 0) {
                                    setMemberId(additionalMemberIds[0]);
                                    setAdditionalMemberIds(additionalMemberIds.slice(1));
                                  } else {
                                    setMemberId("");
                                  }
                                } else if (isAdditional) {
                                  setAdditionalMemberIds(additionalMemberIds.filter(id => id !== m.id));
                                } else {
                                  if (!memberId) {
                                    setMemberId(m.id);
                                    setName(m.name);
                                  } else {
                                    if (1 + additionalMemberIds.length < (Number(participantCount) || 1)) {
                                      setAdditionalMemberIds([...additionalMemberIds, m.id]);
                                    }
                                  }
                                }
                              }} 
                              className="hidden" 
                            />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500'}`}>
                              {isSelected && <FiCheck className="text-white text-xs" />}
                            </div>
                            <span className="font-medium">{m.name}</span>
                            {isPrimary && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded ml-auto">Primary</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(searchResults.length === 0 && mobile.length === 10) && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Full Name (New Member)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                      placeholder="Enter full name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                )}

                {(Number(participantCount) || 1) > 1 + additionalMemberIds.length && (
                  <div className="pt-2">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-3">Additional Guest Names</label>
                    <div className="space-y-3">
                      {Array.from({ length: (Number(participantCount) || 1) - 1 - additionalMemberIds.length }).map((_, idx) => (
                        <div key={idx}>
                          <input 
                            type="text" 
                            className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none text-sm"
                            placeholder={`Guest ${idx + 2 + additionalMemberIds.length} Name (Optional)`}
                            value={guestNames[idx] || ""}
                            onChange={e => {
                              const newNames = [...guestNames];
                              newNames[idx] = e.target.value;
                              setGuestNames(newNames);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-bold font-['Outfit'] text-white mb-4">Booking Summary</h2>
                <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">Turf</span>
                    <span className="text-white font-bold">{selectedTurfs.map(t => t.name).join(", ")}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">Date</span>
                    <span className="text-white font-bold">{formatIST(new Date(selectedDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#2a2d3e]">
                    <span className="text-gray-400 font-medium">Time Slots ({selectedSlots.length})</span>
                    <div className="text-right">
                      {selectedSlots.map((s, i) => (
                        <div key={i} className="text-white text-sm">{s.label}</div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-white">₹{Number(totalPrice.toFixed(2))}</span>
                  </div>

                  {primaryMember && (primaryMember.loyaltyPoints || 0) > 0 && (
                    <div className="flex justify-between items-center mb-4 bg-[#1c1f2e] p-3 rounded-lg border border-[#2a2d3e]">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">Loyalty Points: <span className="text-orange-400 font-bold">{primaryMember.loyaltyPoints}</span></span>
                        <span className="text-xs text-gray-400">Max Discount: ₹{maxDiscount} (1 Rupee = {pointsPerRupee} pts)</span>
                        {maxDiscount < 50 && <span className="text-[10px] text-red-400 mt-1">Minimum ₹50 discount required to redeem</span>}
                      </div>
                      <label className={`flex items-center gap-2 ${maxDiscount >= 50 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                        <input type="checkbox" className="hidden" disabled={maxDiscount < 50} checked={redeemPoints && maxDiscount >= 50} onChange={(e) => setRedeemPoints(e.target.checked)} />
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors ${(redeemPoints && maxDiscount >= 50) ? 'bg-orange-500' : 'bg-[#0f1117] border border-[#2a2d3e]'}`}>
                          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${(redeemPoints && maxDiscount >= 50) ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className={`text-sm font-semibold ${(redeemPoints && maxDiscount >= 50) ? 'text-orange-400' : 'text-gray-500'}`}>
                          {(redeemPoints && maxDiscount >= 50) ? 'Applied' : 'Redeem'}
                        </span>
                      </label>
                    </div>
                  )}
                  
                  {redeemPoints && applicableDiscount > 0 && (
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-orange-400 font-medium text-sm">Points Discount</span>
                      <span className="text-orange-400 font-bold">-₹{applicableDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center border-t border-[#2a2d3e] pt-4 mt-2">
                    <span className="text-gray-400 font-medium">Amount to Pay</span>
                    <span className="text-3xl font-black text-emerald-400">₹{Number(finalPrice.toFixed(2))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment & Summary */}
            <div className="flex-1 p-6 md:p-8 bg-[#0f1117] overflow-y-auto flex flex-col">
              <div className="flex justify-between items-center mb-6 hidden md:flex">
                <h2 className="text-xl font-bold font-['Outfit'] text-white">Payment</h2>
                <button className="text-gray-500 hover:text-white" onClick={() => {
                  updateDisplaySession({ status: "IDLE" }).catch(() => {});
                  setShowModal(false);
                }}><FiX size={24} /></button>
              </div>

              <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-5 mb-6 space-y-4">
                <h3 className="text-white font-bold text-lg mb-2">Record Payment</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Cash (₹)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                      value={cashAmount}
                      onChange={e => {
                        const valStr = e.target.value.replace(/\D/g, '');
                        if (valStr === '') {
                          setCashAmount('');
                          return;
                        }
                        const val = parseInt(valStr, 10);
                        setCashAmount(val);
                        if (val + (Number(onlineAmount) || 0) > totalPrice) {
                          setOnlineAmount(Math.max(0, totalPrice - val));
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Online (₹)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                      value={onlineAmount}
                      onChange={e => {
                        const valStr = e.target.value.replace(/\D/g, '');
                        if (valStr === '') {
                          setOnlineAmount('');
                          return;
                        }
                        const val = parseInt(valStr, 10);
                        setOnlineAmount(val);
                        if (val + (Number(cashAmount) || 0) > totalPrice) {
                          setCashAmount(Math.max(0, totalPrice - val));
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#2a2d3e]">
                  <span className="text-sm text-gray-400">Balance Due</span>
                  <span className={`text-lg font-bold ${totalPrice - (Number(cashAmount)||0) - (Number(onlineAmount)||0) > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                    ₹{Number(Math.max(0, totalPrice - (Number(cashAmount)||0) - (Number(onlineAmount)||0)).toFixed(2))}
                  </span>
                </div>
              </div>

              {upiSettings.upiId ? (
                <div className="flex flex-col items-center bg-white rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Scan to Pay via UPI</p>
                  {qrCodeData ? (
                    <img src={qrCodeData} alt="UPI QR Code" className="w-48 h-48 rounded-lg" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  )}
                  <p className="text-sm font-semibold text-gray-800 mt-3">{upiSettings.businessName}</p>
                  <p className="text-xs text-gray-500">{upiSettings.upiId}</p>
                </div>
              ) : (
                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3">
                  <FiCreditCard className="shrink-0 mt-0.5 text-lg" />
                  <p>UPI payments are not configured. Please add your UPI ID in the Settings dashboard.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={handleCastToDisplay}
                  className="bg-[#1c1f2e] border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 rounded-lg px-4 font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  title="Show QR on second screen"
                >
                  Cast Screen
                </button>
                <button 
                  onClick={confirmBooking}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-4 font-bold text-lg transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? "Confirming..." : <><FiCheck /> Confirm (+{selectedSlots.length * 50} Loyalty Pts)</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* End of NEW tab container */}
      </div>
      )}

    </div>
  );
}
