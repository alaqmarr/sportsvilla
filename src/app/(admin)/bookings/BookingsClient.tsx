"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchBookingsByDate, createBooking, searchMember, getUpiId, addPayment, updateDisplaySession, searchMemberByNfc, generateRazorpayPaymentLink, createAdminRazorpayOrder,
  createAdminPhonePeOrder, verifyAdminRazorpayOrder } from "./actions";
import { useAlert } from "@/components/AlertProvider";
import QRCodeLib from "qrcode";
import { formatIST, todayIST } from "@/lib/dateUtils";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { AnimatePresence, motion } from "framer-motion";
import { FiCalendar, FiClock, FiCheck, FiX, FiUser, FiCreditCard, FiMapPin, FiList, FiPlus, FiRadio } from "react-icons/fi";
import ManageBookings from "./ManageBookings";
import { allocateTurfsForSlots, Allocation } from "@/lib/allocationEngine";
import { useNfc } from "@/components/nfc/NfcProvider";
import Script from "next/script";
import { PageHeader, Button, Card, CardContent, Badge } from "@/components/admin/ui";
import { rawAdminTokens } from "@/lib/tokens";

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
  const [activeTab, setActiveTab] = useState<'NEW' | 'MANAGE'>('NEW');
  const [step, setStep] = useState(1);
  
  // Extract unique sports from turfs
  const sports = useMemo(() => {
    const map = new Map();
    turfs.forEach(t => {
      if(t.sports) t.sports.forEach((ts: any) => map.set(ts.sport.id, ts.sport));
    });
    return Array.from(map.values());
  }, [turfs]);

  const [selectedDate, setSelectedDate] = useState(todayIST());
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
  const [generatedRzpLink, setGeneratedRzpLink] = useState<string | null>(null);
  const [generatedRzpLinkQr, setGeneratedRzpLinkQr] = useState<string | null>(null);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [redeemPoints, setRedeemPoints] = useState(false);

  const nfc = useNfc();

  useEffect(() => {
    return nfc.subscribe(async (uid, deviceType) => {
      if (activeTab === 'NEW' && step === 1) {
        const member = await searchMemberByNfc(uid);
        if (member) {
          setMemberId(member.id);
          setName(member.name);
          setMobile(member.mobile);
          showAlert("Member Found", `Found ${member.name}`, "success");
        } else {
          showAlert("Not Found", "No member associated with this card.", "error");
        }
      }
    });
  }, [nfc, activeTab, step, showAlert]);

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
    try {
      const data = await fetchBookingsByDate(selectedDate);
      setBookings(data);
      setSelectedSlots([]);
      setSelectedTurfs([]);
      setCashAmount(0);
      setOnlineAmount(0);
    } catch (error: any) {
      console.error("Failed to load bookings:", error);
      showAlert("Error", error.message || "Failed to load bookings. Please try again.", "error");
    } finally {
      setLoading(false);
    }
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

  // Use sport-specific settings or fallback
  const selectedSport = useMemo(() => sports.find((s: any) => s.id === selectedSportId), [sports, selectedSportId]);
  const slotDuration = selectedSport?.slotDurationMinutes || 30;
  const openTime = selectedSport?.openTime || facilityHours?.openTime || '06:00';
  const closeTime = selectedSport?.closeTime || facilityHours?.closeTime || '23:00';
  const slots = useMemo(() => generateSlots(selectedDate, slotDuration, openTime, closeTime), [selectedDate, slotDuration, openTime, closeTime]);

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

  const autoAllocation = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    return allocateTurfsForSlots(selectedSlots, bookings, applicableTurfs);
  }, [selectedSlots, bookings, applicableTurfs]);

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



  const totalTurfPricePer30m = selectedTurfs.reduce((sum, t) => sum + ((t.bookingPrice || 0) / (t.bookingDurationMinutes || 60) * 30), 0);
  const totalPrice = autoAllocation
    ? autoAllocation.reduce((sum, a) => sum + a.price, 0) * (Number(participantCount) || 1)
    : selectedSlots.length * totalTurfPricePer30m * (Number(participantCount) || 1);

  const primaryMember = searchResults.find(m => m.id === memberId) || (searchResults.length === 1 && searchResults[0].mobile === mobile ? searchResults[0] : null);
  const maxDiscount = primaryMember ? Math.floor((primaryMember.loyaltyPoints || 0) / (pointsPerRupee || 100)) : 0;
  const applicableDiscount = redeemPoints ? Math.min(totalPrice, maxDiscount) : 0;
  const finalPrice = totalPrice - applicableDiscount;

  // Removed manual UPI QR generation as we use Razorpay Dynamic Links now.

  async function generatePaymentLink() {
    if (!mobile && !memberId) return showAlert("Missing Details", "Please provide a mobile number.", "error");
    if (searchResults.length === 0 && !name) return showAlert("Missing Name", "This is a new member, please enter their full name.", "error");
    if (searchResults.length > 1 && !memberId) return showAlert("Select Member", "Multiple family members found. Please select one.", "error");
    
    setIsProcessing(true);
    try {
      // 1. Create the bookings without immediate payment
      const createdBookings = await createBooking({
        turfIds: autoAllocation ? autoAllocation.map(a => a.turfId) : selectedTurfs.map(t => t.id),
        sportId: selectedSportId,
        slots: autoAllocation 
          ? autoAllocation.map(a => ({ startTime: a.startTime, endTime: a.endTime }))
          : selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        memberId,
        mobile,
        name,
        participantCount: participantCount === '' ? 1 : participantCount,
        guestNames,
        additionalMemberIds,
        redeemPoints
      });

      // 2. Generate Razorpay Payment Link for the created bookings
      const shortUrl = await generateRazorpayPaymentLink(createdBookings.map(b => b.id));
      const qrUrl = await QRCodeLib.toDataURL(shortUrl);
      
      setGeneratedRzpLink(shortUrl);
      setGeneratedRzpLinkQr(qrUrl);
      
      showAlert("Payment Link Generated", "Customer can now scan the dynamic Razorpay QR or open the link.", "success");
    } catch (err: any) {
      showAlert("Failed to Generate Link", err.message || "Something went wrong", "error");
    }
    setIsProcessing(false);
  }

  
  async function handleDirectPhonePeCheckout() {
    if (!mobile && !memberId) return showAlert("Missing Details", "Please provide a mobile number.", "error");
    if (searchResults.length === 0 && !name) return showAlert("Missing Name", "This is a new member, please enter their full name.", "error");
    
    setIsProcessing(true);
    try {
      const createdBookings = await createBooking({
        turfIds: autoAllocation ? autoAllocation.map(a => a.turfId) : selectedTurfs.map(t => t.id),
        sportId: selectedSportId,
        slots: autoAllocation 
          ? autoAllocation.map(a => ({ startTime: a.startTime, endTime: a.endTime }))
          : selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        memberId,
        mobile,
        name,
        participantCount: participantCount === '' ? 1 : participantCount,
        guestNames,
        additionalMemberIds,
        redeemPoints
      });

      const bookingIds = createdBookings.map((b: any) => b.id);
      
      const res = await createAdminPhonePeOrder(bookingIds, window.location.origin);
      if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank');
        showAlert("Success", "PhonePe payment opened in new tab. Booking created.", "success");
        setStep(1);
        setActiveTab('MANAGE');
        setIsProcessing(false);
        loadBookings();
      }
    } catch (err: any) {
      console.error(err);
      showAlert("Error", err.message, "error");
      setIsProcessing(false);
    }
  }

  async function handleDirectRazorpayCheckout() {
    if (!mobile && !memberId) return showAlert("Missing Details", "Please provide a mobile number.", "error");
    if (searchResults.length === 0 && !name) return showAlert("Missing Name", "This is a new member, please enter their full name.", "error");
    
    setIsProcessing(true);
    try {
      // 1. Create the bookings without immediate payment
      const createdBookings = await createBooking({
        turfIds: autoAllocation ? autoAllocation.map(a => a.turfId) : selectedTurfs.map(t => t.id),
        sportId: selectedSportId,
        slots: autoAllocation 
          ? autoAllocation.map(a => ({ startTime: a.startTime, endTime: a.endTime }))
          : selectedSlots.map(s => ({ startTime: s.startTime, endTime: s.endTime })),
        memberId,
        mobile,
        name,
        participantCount: participantCount === '' ? 1 : participantCount,
        guestNames,
        additionalMemberIds,
        redeemPoints
      });

      const bookingIds = createdBookings.map((b: any) => b.id);
      
      // 2. Create Razorpay order
      const res = await createAdminRazorpayOrder(bookingIds);

      const options = {
        key: res.keyId,
        amount: Math.round(Number(res.amount) * 100),
        currency: "INR",
        name: "SportsVilla",
        description: `Booking for ${createdBookings.length} slot(s)`,
        order_id: res.orderId,
        handler: async function (response: any) {
          try {
            await verifyAdminRazorpayOrder(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            showAlert("Success", "Payment successful and booking confirmed!", "success");
            setStep(1);
            setActiveTab('MANAGE');
            loadBookings();
          } catch (err: any) {
            showAlert("Error", "Payment verification failed: " + err.message, "error");
          }
        },
        prefill: {
          name: name || "",
          contact: mobile || "",
        },
        theme: {
          color: rawAdminTokens.brandHover,
        },
        // Display ONLY UPI QR directly
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
            sequence: ["block.upi"],
            preferences: { show_default_blocks: false }
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to initialize Razorpay", "error");
    }
    setIsProcessing(false);
  }

  async function confirmBooking() {
    if (!mobile && !memberId) return showAlert("Missing Details", "Please provide a mobile number.", "error");
    if (searchResults.length === 0 && !name) return showAlert("Missing Name", "This is a new member, please enter their full name.", "error");
    if (searchResults.length > 1 && !memberId) return showAlert("Select Member", "Multiple family members found. Please select one.", "error");
    
    setIsProcessing(true);
    try {
      const familyGuestNames = additionalMemberIds.map(id => searchResults.find(r => r.id === id)?.name || "");
      const finalGuestNames = [...familyGuestNames, ...guestNames.slice(0, (Number(participantCount) || 1) - 1 - familyGuestNames.length)];

      let createdBookings: any[] = [];
      if (autoAllocation) {
        for (const alloc of autoAllocation) {
          const allocSlots = selectedSlots.filter(s => s.startTime.getTime() >= alloc.startTime.getTime() && s.endTime.getTime() <= alloc.endTime.getTime());
          const res = await createBooking({
            turfIds: [alloc.turfId],
            sportId: selectedSportId,
            slots: allocSlots,
            memberId: memberId || undefined,
            mobile: !memberId ? mobile : undefined,
            name: !memberId ? name : undefined,
            participantCount: Number(participantCount) || 1,
            guestNames: finalGuestNames,
            additionalMemberIds: additionalMemberIds,
            redeemPoints: redeemPoints
          });
          createdBookings = createdBookings.concat(res || []);
        }
      } else {
        const res = await createBooking({
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
        createdBookings = res || [];
      }
      
      if (createdBookings && createdBookings.length > 0) {
        const totalCash = Number(cashAmount) || 0;
        const totalOnline = Number(onlineAmount) || 0;
        const totalBookingsPrice = createdBookings.reduce((sum: number, b: any) => sum + (b.price || 0), 0) || totalPrice || 1;

        let allocatedCash = 0;
        let allocatedOnline = 0;

        for (let i = 0; i < createdBookings.length; i++) {
          const b = createdBookings[i];
          const isLast = i === createdBookings.length - 1;
          const ratio = (b.price || 0) / totalBookingsPrice;

          const bCash = isLast ? (totalCash - allocatedCash) : Math.round(totalCash * ratio);
          allocatedCash += bCash;

          const bOnline = isLast ? (totalOnline - allocatedOnline) : Math.round(totalOnline * ratio);
          allocatedOnline += bOnline;

          if (bCash > 0) {
            await addPayment(b.id, bCash, "CASH");
          }
          if (bOnline > 0) {
            await addPayment(b.id, bOnline, "ONLINE");
          }
        }

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
      setStep(1);
      setActiveTab('MANAGE');
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
    <div className="space-y-6 pb-12 font-sans text-sv-text">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <PageHeader
        title="Sports Bookings"
        subtitle="Manage court reservations, create walk-in bookings, and collect offline or gateway payments"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Bookings" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'MANAGE' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<FiList />}
              onClick={() => setActiveTab('MANAGE')}
            >
              Manage Bookings
            </Button>
            <Button
              variant={activeTab === 'NEW' ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<FiPlus />}
              onClick={() => setActiveTab('NEW')}
            >
              New Booking
            </Button>
          </div>
        }
      />

      {activeTab === 'MANAGE' ? (
        <ManageBookings />
      ) : (
        <div className="animate-in fade-in duration-300 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-sv-text font-sans tracking-tight">Create New Booking</h2>
              <p className="text-sv-text-muted text-xs sm:text-sm mt-0.5">Select Sport ➔ Select Slots ➔ Pick Court ➔ Payment</p>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-sv-brand' : 'bg-sv-surface-raised'}`} />
            ))}
          </div>

          <Card variant="default">
            <CardContent className="p-6">
            {/* STEP 1: Customer Details */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-bold text-sv-text font-sans flex items-center gap-2 mb-6">1. Customer Details</h3>
              <div className="space-y-6 max-w-md">
                <div className="bg-sv-success-subtle border border-[#2a2d3e] border-sv-success-border border-[#2a2d3e] p-4 rounded-sv-md mb-4 text-sv-success-text text-sm font-semibold flex items-center gap-2">
                  <FiCreditCard /> Tap NFC Card to automatically fetch member details
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Mobile Number (or Tap NFC)</label>
                  <input 
                    type="tel" 
                    className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleMobileSearch(val);
                    }}
                  />
                  {searchResults.length > 0 && !memberId && (
                    <div className="mt-2 bg-sv-surface-raised border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-xl overflow-hidden shadow-xl animate-in slide-in-from-top-2">
                      {searchResults.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => {
                            setMemberId(member.id);
                            setName(member.name);
                            setSearchResults([]);
                          }}
                          className="w-full text-left px-4 py-3 border-b border-sv-border border-[#2a2d3e] hover:bg-sv-surface-hover transition flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-white group-hover:text-orange-400 transition">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.mobile}</div>
                          </div>
                          {member.loyaltyPoints > 0 && (
                            <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                              ★ {member.loyaltyPoints} pts
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Customer Name</label>
                  <input 
                    type="text"
                    required
                    className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    readOnly={!!memberId}
                  />
                </div>
                <button
                  type="button"
                  disabled={!name || mobile.length !== 10}
                  onClick={() => setStep(2)}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-sv-surface-raised disabled:text-gray-500 text-white py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] disabled:shadow-none"
                >
                  Continue to Booking
                </button>
              </div>
            </div>

            {/* STEP 2: Date & Sport */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2 mb-6">2. Date & Sport</h2>
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-3">Select Sport</label>
                  <div className="flex flex-col gap-2">
                    {sports.map((sport: any) => (
                      <button 
                        key={sport.id}
                        onClick={() => setSelectedSportId(sport.id)}
                        className={`px-4 py-3 rounded-lg text-left transition-colors font-medium ${selectedSportId === sport.id ? 'bg-orange-500/10 text-orange-500 border border-[#2a2d3e] border-orange-500/30' : 'text-gray-400 hover:bg-sv-surface-hover/50 border border-[#2a2d3e] border-transparent'}`}
                      >
                        {sport.name}
                      </button>
                    ))}
                    {sports.length === 0 && <div className="text-gray-500 text-sm">No sports configured with turfs.</div>}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 hover:text-white bg-sv-surface-raised hover:bg-sv-surface-hover rounded-xl font-bold transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-all">Continue</button>
                </div>
              </div>
            </div>

            {/* STEP 3: Time Slots & Courts */}
            <div className={step === 3 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2 mb-6">3. Select Time Slots & Courts</h2>
              <div className="space-y-10">
                <div>
                  {loading ? (
                    <div className="p-4">
                      <TableSkeleton rows={6} cols={6} />
                    </div>
                  ) : selectedSportId ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-300 flex items-center gap-2">
                          Available Slots
                        </h2>
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <div className="flex items-center gap-1.5 text-gray-500"><div className="w-3 h-3 rounded bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e]"></div> Available</div>
                          <div className="flex items-center gap-1.5 text-gray-500"><div className="w-3 h-3 rounded bg-orange-500 border border-[#2a2d3e] border-orange-600"></div> Selected</div>
                          <div className="flex items-center gap-1.5 text-gray-500"><div className="w-3 h-3 rounded bg-sv-surface-raised opacity-50 border border-[#2a2d3e] border-red-500/30"></div> Fully Booked</div>
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
                                p-3 rounded-lg border border-[#2a2d3e] transition-all flex flex-col items-center justify-center gap-1 cursor-pointer
                                ${status === 'AVAILABLE' ? 'bg-transparent border-sv-border border-[#2a2d3e] text-gray-300 hover:border-orange-500/50' : ''}
                                ${status === 'SELECTED' ? 'bg-orange-500 border-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]' : ''}
                                ${status === 'BOOKED' ? 'bg-sv-surface-raised border-red-500/20 text-gray-400 opacity-50 cursor-not-allowed' : ''}
                                ${status === 'UNAVAILABLE' ? 'bg-transparent border-sv-border border-[#2a2d3e] text-gray-400 opacity-40 cursor-not-allowed' : ''}
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

                {selectedSlots.length > 0 && autoAllocation && (
                  <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2 mb-6">
                      Smart Allocation Breakdown
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {autoAllocation.map((alloc, i) => (
                        <div key={i} className="text-left p-4 rounded-xl border border-[#2a2d3e] border-emerald-500 bg-sv-surface-raised shadow-[0_0_15px_rgba(16,185,129,0.15)] relative overflow-hidden">
                          <div className="font-bold text-white text-lg mb-1">{alloc.turfName}</div>
                          <div className="text-sm text-gray-400">₹{alloc.price}</div>
                          <div className="text-sm font-semibold text-emerald-400 mt-2">
                            {formatIST(alloc.startTime, 'h:mm a')} to {formatIST(alloc.endTime, 'h:mm a')}
                          </div>
                          <div className="absolute top-4 right-4 text-emerald-500 text-xl">
                            <FiCheck />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedSlots.length > 0 && !autoAllocation && (
                  <div className="animate-in slide-in-from-bottom-4 duration-300 pt-6 border-t border-sv-border border-[#2a2d3e]">
                    <h2 className="text-xl font-bold font-sans text-white flex items-center gap-2 mb-6">
                      Select Available Court
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
                            text-left p-4 rounded-xl border border-[#2a2d3e] transition-all relative overflow-hidden
                            ${ta.isBooked 
                              ? 'bg-transparent border-red-500/20 opacity-60 cursor-not-allowed' 
                              : selectedTurfs.some(t => t.id === ta.turf.id)
                                ? 'bg-sv-surface-raised border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] cursor-pointer'
                                : 'bg-transparent border-sv-border border-[#2a2d3e] hover:border-emerald-500/50 cursor-pointer'
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
                
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="w-48 py-4 text-gray-400 hover:text-white bg-sv-surface-raised hover:bg-sv-surface-hover rounded-xl font-bold transition-colors">Back</button>
                  <button
                    onClick={() => {
                      setParticipantCount(1);
                      setGuestNames([]);
                      setAdditionalMemberIds([]);
                      setStep(4);
                    }}
                    disabled={selectedSlots.length === 0 || (!autoAllocation && selectedTurfs.length === 0)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-sv-surface-raised disabled:text-gray-500 text-white py-4 rounded-xl font-bold transition-all"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 4: Checkout */}
            <div className={step === 4 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold font-sans text-white mb-6">4. Checkout & Payment</h2>
              <div className="flex flex-col md:flex-row gap-8 bg-transparent">
                {/* Left: Customer Details */}
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-5">
                {((autoAllocation ? autoAllocation.some(a => {
                  const t = turfs.find(t => t.id === a.turfId);
                  return t?.requireEntryVerification || (t?.capacityPerSlot || 1) > 1;
                }) : selectedTurfs.some(t => t.requireEntryVerification || t.capacityPerSlot > 1))) && (
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
                      className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
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
                          <label key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border border-[#2a2d3e] cursor-pointer transition-colors ${isSelected ? 'bg-sv-surface-raised border-emerald-500 text-white' : 'border-sv-border border-[#2a2d3e] text-gray-400 hover:bg-sv-surface-raised'}`}>
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
                            <div className={`w-5 h-5 rounded border border-[#2a2d3e] flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500'}`}>
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
                      className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
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
                            className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-lg px-4 py-3 text-white focus:border-sv-brand/50 focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
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
                <h2 className="text-lg font-bold font-sans text-white mb-4">Booking Summary</h2>
                <div className="bg-sv-surface-raised rounded-xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">Turf</span>
                    <span className="text-white font-bold">{autoAllocation ? autoAllocation.map(a => a.turfName).join(", ") : selectedTurfs.map(t => t.name).join(", ")}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">Date</span>
                    <span className="text-white font-bold">{formatIST(new Date(selectedDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-sv-border border-[#2a2d3e]">
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
                    <div className="flex justify-between items-center mb-4 bg-sv-surface-raised p-3 rounded-lg border border-[#2a2d3e] border-sv-border border-[#2a2d3e]">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">Loyalty Points: <span className="text-orange-400 font-bold">{primaryMember.loyaltyPoints}</span></span>
                        <span className="text-xs text-gray-400">Max Discount: ₹{maxDiscount} (1 Rupee = {pointsPerRupee} pts)</span>
                        {maxDiscount < 50 && <span className="text-[10px] text-red-400 mt-1">Minimum ₹50 discount required to redeem</span>}
                      </div>
                      <label className={`flex items-center gap-2 ${maxDiscount >= 50 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                        <input type="checkbox" className="hidden" disabled={maxDiscount < 50} checked={redeemPoints && maxDiscount >= 50} onChange={(e) => setRedeemPoints(e.target.checked)} />
                        <div className={`w-10 h-5 rounded-full p-1 transition-colors ${(redeemPoints && maxDiscount >= 50) ? 'bg-orange-500' : 'bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e]'}`}>
                          <div className={`w-3 h-3 bg-[#161923] rounded-full transition-transform ${(redeemPoints && maxDiscount >= 50) ? 'translate-x-5' : ''}`}></div>
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

                  <div className="flex justify-between items-center border-t border-sv-border border-[#2a2d3e] pt-4 mt-2">
                    <span className="text-gray-400 font-medium">Amount to Pay</span>
                    <span className="text-3xl font-black text-emerald-400">₹{Number(finalPrice.toFixed(2))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment & Summary */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col bg-transparent">
              <div className="flex justify-between items-center mb-6 hidden md:flex">
                <h2 className="text-xl font-bold font-sans text-white">Payment</h2>
                <button className="text-gray-500 hover:text-white" onClick={() => {
                  updateDisplaySession({ status: "IDLE" }).catch(() => {});
                  setShowModal(false);
                }}><FiX size={24} /></button>
              </div>

              <div className="mb-6 space-y-4">
                <h3 className="text-white font-bold text-lg mb-2">Record Payment</h3>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2">Cash (₹)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
                      value={cashAmount}
                      onChange={e => {
                        const valStr = e.target.value.replace(/\D/g, '');
                        if (valStr === '') {
                          setCashAmount('');
                          return;
                        }
                        const val = parseInt(valStr, 10);
                        setCashAmount(val);
                        if (val + (Number(onlineAmount) || 0) > finalPrice) {
                          setOnlineAmount(Math.max(0, finalPrice - val));
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
                      className="w-full bg-transparent border-b border-sv-border border-[#2a2d3e] px-2 py-3 text-white focus:border-sv-brand focus:outline-none transition-colors"
                      value={onlineAmount}
                      onChange={e => {
                        const valStr = e.target.value.replace(/\D/g, '');
                        if (valStr === '') {
                          setOnlineAmount('');
                          return;
                        }
                        const val = parseInt(valStr, 10);
                        setOnlineAmount(val);
                        if (val + (Number(cashAmount) || 0) > finalPrice) {
                          setCashAmount(Math.max(0, finalPrice - val));
                        }
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-sv-border border-[#2a2d3e]">
                  <span className="text-sm text-gray-400">Pay at Counter (PAC)</span>
                  <span className={`text-lg font-bold ${finalPrice - (Number(cashAmount)||0) - (Number(onlineAmount)||0) > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                    ₹{Number(Math.max(0, finalPrice - (Number(cashAmount)||0) - (Number(onlineAmount)||0)).toFixed(2))}
                  </span>
                </div>
              </div>

              {generatedRzpLinkQr ? (
                <div className="flex flex-col items-center bg-[#161923] rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Scan to Pay via Razorpay</p>
                  <img src={generatedRzpLinkQr} alt="Razorpay QR Code" className="w-48 h-48 rounded-lg" />
                  <a href={generatedRzpLink!} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-500 mt-3 hover:underline">
                    Open Payment Link
                  </a>
                  <p className="text-xs text-gray-500 text-center mt-2">The booking has been created as UNPAID.<br/>Payment will be tracked automatically.</p>
                </div>
              ) : (
                <div className="bg-blue-500/10 border border-[#2a2d3e] border-blue-500/20 text-blue-400 p-4 rounded-xl text-sm font-medium mb-6 flex items-start gap-3">
                  <FiCreditCard className="shrink-0 mt-0.5 text-lg" />
                  <p>Choose "Razorpay" or "PhonePe" to open the gateway and collect payment.</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                
                  <div className="flex gap-3">
                    <button 
                      onClick={handleDirectRazorpayCheckout}
                      disabled={isProcessing || !!generatedRzpLink || finalPrice - (Number(cashAmount) || 0) - (Number(onlineAmount) || 0) <= 0}
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 hover:bg-blue-500 text-white rounded-lg py-4 font-bold transition-colors disabled:opacity-50"
                    >
                      Razorpay
                    </button>
                    <button 
                      onClick={handleDirectPhonePeCheckout}
                      disabled={isProcessing || !!generatedRzpLink || finalPrice - (Number(cashAmount) || 0) - (Number(onlineAmount) || 0) <= 0}
                      className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white rounded-lg py-4 font-bold transition-colors disabled:opacity-50"
                    >
                      PhonePe
                    </button>

                    <button 
                      onClick={handleCastToDisplay}
                      className="flex-1 bg-sv-surface-raised border border-[#2a2d3e] border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 rounded-lg py-4 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      title="Show QR on second screen"
                    >
                      Cast Screen
                    </button>
                  </div>
                {generatedRzpLink ? (
                  <button 
                    onClick={() => {
                      setStep(1);
                      setActiveTab('MANAGE');
                      setGeneratedRzpLink(null);
                      setGeneratedRzpLinkQr(null);
                      setCashAmount(0);
                      setOnlineAmount(0);
                      loadBookings();
                    }}
                    className="w-full bg-blue-500 hover:bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-4 font-bold text-lg transition-colors border-none cursor-pointer flex items-center justify-center gap-2"
                  >
                    Done
                  </button>
                ) : (
                  <button 
                    onClick={confirmBooking}
                    disabled={isProcessing}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-4 font-bold text-lg transition-colors border-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? "Confirming..." : <><FiCheck /> Confirm Unpaid / Cash Booking</>}
                  </button>
                )}
              </div>
            </div>
              </div>
            </div>
            {/* End Step 4 */}
            </CardContent>
          </Card>
      
      {/* End of NEW tab container */}
      </div>
      )}

    </div>
  );
}
