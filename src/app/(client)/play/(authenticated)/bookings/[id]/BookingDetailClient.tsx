"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, MessageCircle, X, MapPin, Calendar, Clock, Share2, CheckCircle, ShieldAlert, Navigation, Users, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Modal } from "@/components/play/Modal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function BookingDetailClient({ initialBooking, cancellationLimitHours, allowCancellation }: { initialBooking: any, cancellationLimitHours: number, allowCancellation: boolean }) {
  const router = useRouter();

  const { data, mutate } = useSWR(
    initialBooking.id ? `/api/client/v1/bookings/${initialBooking.id}` : null,
    fetcher,
    {
      fallbackData: { booking: initialBooking, cancellationLimitHours, allowCancellation },
      refreshInterval: (data) => data?.booking?.status === "CONFIRMED" ? 3000 : 0,
    }
  );

  const booking = data?.booking || initialBooking;
  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED";
  const isCompleted = booking.status === "COMPLETED";
  const isCancellable = isConfirmed && allowCancellation;

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isAppPromptOpen, setIsAppPromptOpen] = useState(false);
  const [appPromptAction, setAppPromptAction] = useState<'cancel' | 'reschedule' | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isTogglingHost, setIsTogglingHost] = useState(false);
  const [qrSrc, setQrSrc] = useState("");

  useEffect(() => {
    if (booking.id) {
      QRCode.toDataURL(booking.id, {
        width: 200,
        margin: 1,
        color: {
          dark: "#111827",
          light: "#FFFFFF",
        },
      })
      .then(setQrSrc)
      .catch(console.error);
    }
  }, [booking.id]);

  const handleActionClick = (actionType: 'cancel' | 'reschedule') => {
    if (actionType === 'reschedule') {
      setAppPromptAction('reschedule');
      setIsAppPromptOpen(true);
      return;
    }

    const ua = navigator.userAgent;
    const isMobile = /android|iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isMobile) {
      setAppPromptAction('cancel');
      setIsAppPromptOpen(true);
    } else {
      setIsCancelModalOpen(true);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/client/v1/bookings/${booking.id}/cancel`, { method: "POST" });
      if (res.ok) {
        setIsCancelModalOpen(false);
        mutate();
      } else {
        const result = await res.json();
        alert(result.error || "Failed to cancel booking");
      }
    } catch (e) {
      alert("An error occurred while cancelling.");
    } finally {
      setIsCancelling(false);
    }
  };


  const handleToggleHost = async () => {
    setIsTogglingHost(true);
    const newVisibility = booking.visibility === 'OPEN' ? 'PRIVATE' : 'OPEN';
    try {
      const res = await fetch(`/api/client/v1/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility })
      });
      if (res.ok) {
        mutate();
      } else {
        const result = await res.json();
        alert(result.error || "Failed to change hosting status");
      }
    } catch (e) {
      alert("An error occurred while changing hosting status.");
    } finally {
      setIsTogglingHost(false);
    }
  };

  const statusColors = {
    CONFIRMED: "bg-emerald-500 text-white",
    CANCELLED: "bg-rose-500 text-white",
    COMPLETED: "bg-gray-500 text-white",
    PENDING: "bg-amber-500 text-white",
  };

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const isPast = startDate < new Date();

  const getCancellationInfo = () => {
    if (!booking) return { penalty: 0, refund: 0, isFree: true, totalPaid: 0 };
    
    const walletPayments = booking.payments?.filter((p: any) => p.method === 'WALLET') || [];
    const totalPaid = walletPayments.reduce((sum: number, p: any) => sum + p.amount, 0);

    const now = new Date();
    const diffMs = startDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let penalty = 0;
    let isFree = true;

    if (diffHours < cancellationLimitHours && diffHours >= 0) {
      const hourIndex = Math.ceil(cancellationLimitHours - diffHours);
      const penaltyPercentage = hourIndex / cancellationLimitHours;
      penalty = booking.price * penaltyPercentage;
      isFree = false;
    }

    const refund = Math.max(0, totalPaid - penalty);
    return { penalty, refund, isFree, totalPaid };
  };

  const cancelInfo = getCancellationInfo();

  return (
    <div className="min-h-screen bg-[var(--play-bg)] pb-24">
      {/* Dynamic Header */}
      <div className={`sticky top-0 z-20 ${statusColors[booking.status as keyof typeof statusColors] || "bg-[var(--play-brand)] text-white"}`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold font-outfit">Booking Ticket</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-black/10 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Status</p>
              <h2 className="text-3xl font-bold font-outfit flex items-center gap-2">
                {isConfirmed && <CheckCircle className="w-8 h-8" />}
                {isCancelled && <ShieldAlert className="w-8 h-8" />}
                {booking.status}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Amount</p>
              <p className="text-2xl font-bold font-outfit">₹{booking.price}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-6 relative z-10 w-full max-w-6xl mx-auto pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Ticket & Location */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Ticket Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--play-border)] overflow-hidden">
              <div className="p-5 flex gap-4 border-b border-[var(--play-border)] border-dashed">
                <div className="w-16 h-16 bg-[var(--play-surface-alt)] rounded-xl flex items-center justify-center shrink-0 border border-[var(--play-border)]">
                  {booking.sport?.iconPath ? (
                    <img src={booking.sport.iconPath} alt={booking.sport.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="font-bold text-[var(--play-brand)]">{booking.sport?.name?.[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--play-text)]">{booking.turf?.name}</h3>
                  <p className="text-[var(--play-text-muted)] text-sm">{booking.sport?.name} Match</p>
                </div>
              </div>
              
              <div className="p-5 grid grid-cols-2 gap-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--play-text-muted)] mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase font-semibold tracking-wider">Date</span>
                  </div>
                  <p className="font-bold text-[var(--play-text)]">{startDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[var(--play-text-muted)] mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs uppercase font-semibold tracking-wider">Time</span>
                  </div>
                  <p className="font-bold text-[var(--play-text)]">
                    {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Section - Only show if confirmed and not completely past */}
            {isConfirmed && !isCompleted && (
              <div className="bg-white rounded-2xl shadow-sm border border-[var(--play-border)] p-6 flex flex-col items-center justify-center">
                <p className="text-sm text-[var(--play-text-muted)] font-medium mb-4 uppercase tracking-widest">Entry Pass</p>
                <div className="p-3 border-2 border-[var(--play-border)] rounded-xl inline-block bg-white">
                  {qrSrc ? (
                    <img src={qrSrc} alt="QR Code" className="w-40 h-40 object-contain" />
                  ) : (
                    <div className="w-40 h-40 bg-[var(--play-surface-alt)] animate-pulse rounded-lg" />
                  )}
                </div>
                <p className="text-[10px] text-[var(--play-text-light)] mt-4 w-full text-center uppercase tracking-widest font-mono">
                  ID: {booking.id}
                </p>
              </div>
            )}

            {/* Location Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--play-border)] p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--play-brand)]" />
                  <h3 className="font-bold text-[var(--play-text)]">Venue Location</h3>
                </div>
                <button className="text-[var(--play-brand)] bg-[var(--play-brand-light)] p-2 rounded-full hover:bg-[var(--play-brand)] hover:text-white transition-colors">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[var(--play-text-muted)] text-sm ml-7 leading-relaxed">
                {booking.turf?.location || "No exact address provided by venue."}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Participants & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Host & Participants */}
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--play-border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--play-border)] bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-[var(--play-text)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--play-brand)]" /> Players
                </h3>
                {booking.inviteMaxCount > 0 && (
                  <span className="text-sm font-medium text-[var(--play-text-muted)]">
                    {(booking.participants?.length || 0) + 1} / {booking.inviteMaxCount}
                  </span>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--play-brand)] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {booking.member?.name?.[0]?.toUpperCase() || "H"}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--play-text)] text-sm">{booking.member?.name || "Host"}</p>
                    <p className="text-xs text-[var(--play-text-muted)]">Host (Organizer)</p>
                  </div>
                </div>
                
                {booking.participants?.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--play-surface-alt)] text-[var(--play-text-muted)] rounded-full flex items-center justify-center font-bold text-sm">
                      {p.member?.name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--play-text)] text-sm">{p.member?.name || "Player"}</p>
                      <p className="text-xs text-[var(--play-text-muted)]">Joined</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite Section */}
            {(booking.visibility === 'OPEN' || booking.visibility === 'INVITE_ONLY') && booking.inviteCode && (
              <div className="bg-white rounded-2xl shadow-sm border border-[var(--play-border)] p-5 text-center">
                <p className="text-sm text-[var(--play-text-muted)] font-medium mb-3">Invite friends to join this game</p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex justify-between items-center mb-3">
                  <span className="font-mono font-bold tracking-widest text-[var(--play-brand)]">{booking.inviteCode}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(booking.inviteCode)}
                    className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 font-medium"
                  >
                    Copy
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/play/join-game/${booking.inviteCode}`;
                    if (navigator.share) {
                      navigator.share({ title: 'Join my game on SportsVilla!', url });
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Invite link copied to clipboard!');
                    }
                  }}
                  className="w-full py-3 bg-[var(--play-brand)] text-white font-bold rounded-xl hover:brightness-110 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Share2 className="w-4 h-4" /> Share Link
                </button>
              </div>
            )}

            {/* Actions & Hosting (Only if confirmed and not past) */}
            {isConfirmed && !isPast && (
              <div className="space-y-3">
                <button
                  onClick={handleToggleHost}
                  disabled={isTogglingHost}
                  className={`w-full py-4 px-4 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                    booking.visibility === 'OPEN' 
                      ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200' 
                      : 'bg-[var(--play-text)] text-white hover:bg-black'
                  }`}
                >
                  {booking.visibility === 'OPEN' ? (
                    <><Users className="w-5 h-5" /> Stop Hosting Game</>
                  ) : (
                    <><UserPlus className="w-5 h-5" /> Host Game (Find Players)</>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleActionClick('reschedule')}
                    className="py-3.5 flex flex-col items-center justify-center gap-1 bg-white border border-[var(--play-border)] rounded-2xl hover:bg-[var(--play-surface)] transition-colors shadow-sm"
                  >
                    <Calendar className="w-5 h-5 text-[var(--play-text)]" />
                    <span className="text-[var(--play-text)] font-bold text-sm">Reschedule</span>
                  </button>
                  
                  {isCancellable && (
                    <button
                      onClick={() => handleActionClick('cancel')}
                      className="py-3.5 flex flex-col items-center justify-center gap-1 bg-white border border-[var(--play-error)] rounded-2xl hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <X className="w-5 h-5 text-[var(--play-error)]" />
                      <span className="text-[var(--play-error)] font-bold text-sm">Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>


      {/* Cancel Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} size="sm">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-5">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold font-outfit text-[var(--play-text)] mb-2">Cancel Booking?</h2>
          <div className="text-[var(--play-text-muted)] text-sm mb-6 leading-relaxed w-full space-y-2">
            <p className="text-center">Are you sure you want to cancel?</p>
            {cancelInfo.isFree ? (
              <p className="text-[var(--play-brand)] font-semibold text-center">
                You are cancelling {cancellationLimitHours}+ hours prior. You will receive a full refund of ₹{cancelInfo.refund} to your Wallet.
              </p>
            ) : (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-left w-full mt-2">
                <p className="font-semibold mb-1 text-center">Late Cancellation Penalty</p>
                <div className="flex justify-between text-xs mb-1">
                  <span>Total Paid:</span>
                  <span>₹{cancelInfo.totalPaid}</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cancellation Fee:</span>
                  <span className="font-semibold">-₹{Math.round(cancelInfo.penalty)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-red-200 pt-1 mt-1">
                  <span>Wallet Refund:</span>
                  <span>₹{Math.round(cancelInfo.refund)}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-center mt-2 text-gray-500">Call support for discrepancies.</p>
          </div>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => setIsCancelModalOpen(false)}
              className="flex-1 py-4 bg-[var(--play-surface)] text-[var(--play-text)] font-bold rounded-xl border border-[var(--play-border)] hover:bg-[var(--play-surface-alt)] transition-colors"
            >
              Keep It
            </button>
            <button 
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 py-4 bg-[var(--play-error)] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      {/* App Prompt Modal */}
      <Modal isOpen={isAppPromptOpen} onClose={() => setIsAppPromptOpen(false)} size="sm">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--play-surface-alt)] rounded-2xl flex items-center justify-center mb-5 overflow-hidden">
            <img src="/icon.png" alt="Sportsvilla" className="w-12 h-12 object-contain rounded-xl" />
          </div>
          
          <h2 className="text-2xl font-bold font-outfit text-[var(--play-text)] mb-2 text-center">Get the App</h2>
          <p className="text-[var(--play-text-muted)] text-sm mb-6 leading-relaxed text-center">
            {appPromptAction === 'reschedule' 
              ? "To reschedule your booking, please download our mobile app." 
              : "To cancel your booking from your mobile device, please download our app."}
          </p>
          
          <div className="flex flex-col gap-3 w-full">
            <a 
              href="https://play.google.com/store/apps/details?id=com.sportsvilla"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3 bg-black text-white rounded-xl shadow-md hover:brightness-110 transition-all border border-gray-800"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M3.609 1.814L13.792 12 3.61 22.186c-.165-.136-.25-.333-.25-.561V2.375c0-.228.085-.425.25-.561zM14.542 12.75l2.457 2.457-11.83 6.828 9.373-9.285zM15.292 12l4.896-2.825c.531-.307.531-.806 0-1.112l-4.896-2.825-3.143 3.143L15.292 12zM5.169 1.966l11.83 6.828-2.457 2.457-9.373-9.285z"/></svg>
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase leading-none text-gray-300">GET IT ON</span>
                <span className="font-semibold leading-none mt-0.5">Google Play</span>
              </div>
            </a>
            
            <a 
              href="https://apps.apple.com/app/sportsvilla/id123456789"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full py-3 bg-black text-white rounded-xl shadow-md hover:brightness-110 transition-all border border-gray-800"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.43.987 3.96.948 1.56-.027 2.614-1.493 3.594-2.923 1.135-1.666 1.6-3.284 1.622-3.375-.035-.017-3.155-1.21-3.196-4.834-.035-3.037 2.47-4.496 2.585-4.566-1.428-2.088-3.626-2.37-4.432-2.404-1.748-.168-3.535 1.04-4.458 1.04zm2.148-3.05c.813-.984 1.36-2.355 1.211-3.714-1.168.047-2.614.776-3.454 1.748-.75.819-1.391 2.224-1.211 3.551 1.306.1 2.641-.599 3.454-1.585z"/></svg>
              <div className="flex flex-col items-start">
                <span className="text-[10px] leading-none text-gray-300">Download on the</span>
                <span className="font-semibold leading-none mt-0.5">App Store</span>
              </div>
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
}
