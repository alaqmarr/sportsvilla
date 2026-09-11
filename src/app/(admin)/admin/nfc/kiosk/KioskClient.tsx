"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Script from "next/script";
import { formatIST, todayIST } from "@/lib/dateUtils";
import { NfcCheckinResponse, NfcDeviceType } from "@/types/nfc";
import {
  FiZap,
  FiXCircle,
  FiCalendar,
  FiAward,
  FiDollarSign,
  FiClock,
  FiMaximize,
  FiMinimize,
  FiRadio,
  FiTerminal,
  FiVolumeX,
  FiVolume2,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiAlertTriangle,
  FiUser,
  FiActivity,
  FiHardDrive,
} from "react-icons/fi";
import { useNfc } from "@/components/nfc/NfcProvider";
import { playNfcSound } from "@/lib/soundUtils";
import KioskBookingFlow from "./KioskBookingFlow";
import { useAlert } from "@/components/AlertProvider";

interface KioskClientProps {
  initialTransactions?: any[];
}

export default function KioskClient({ initialTransactions = [] }: KioskClientProps) {
  // Activity feed state
  const [activityFeed, setActivityFeed] = useState<any[]>(initialTransactions);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<NfcCheckinResponse | null>(null);
  const [lastScannedCardUid, setLastScannedCardUid] = useState<string | null>(null);
  const [isBookingMode, setIsBookingMode] = useState<boolean>(false);

  // Kiosk settings & status
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Simulator / manual test input
  const [manualUid, setManualUid] = useState<string>("");

  // Auto-dismiss countdown timer
  const [dismissProgress, setDismissProgress] = useState<number>(100);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live IST Clock effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(formatIST(now, "hh:mm:ss a"));
      setCurrentDate(formatIST(now, "EEEE, d MMMM yyyy"));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Secret Hotkey for Simulator Panel
  const [showSimulator, setShowSimulator] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "n") {
        setShowSimulator(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  };

  /**
   * Clears result overlay and resets progress
   */
  const dismissResult = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setActiveResult(null);
    setDismissProgress(100);
  }, []);

  /**
   * Starts 6-second auto-dismiss countdown with visual progress bar
   */
  const triggerAutoDismiss = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setDismissProgress(100);
    const totalMs = 6000;
    const stepMs = 50;
    let elapsed = 0;

    progressIntervalRef.current = setInterval(() => {
      elapsed += stepMs;
      const remaining = Math.max(0, 100 - (elapsed / totalMs) * 100);
      setDismissProgress(remaining);
      if (elapsed >= totalMs) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, stepMs);

    dismissTimerRef.current = setTimeout(() => {
      dismissResult();
    }, totalMs);
  }, [dismissResult]);

  /**
   * Process NFC card capture from any hardware source
   */
  const handleCardScan = useCallback(
    async (cardUid: string, deviceType: NfcDeviceType) => {
      setIsProcessing(true);
      setLastScannedCardUid(cardUid);

      try {
        const res = await fetch("/api/nfc/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cardUid,
            deviceType,
            location: "MAIN_KIOSK_DESK",
          }),
        });

        const data: NfcCheckinResponse = await res.json();
        setActiveResult(data);

        // Sound feedback
        if (soundEnabled) {
          if (data.success) {
            playNfcSound("success");
          } else {
            playNfcSound("error");
          }
        }

        // Prepend to live activity feed
        const newFeedItem = {
          id: `scan-${Date.now()}`,
          cardUid,
          deviceType,
          type: data.action === "DROPIN_DEDUCTED" ? "DROPIN" : "CHECKIN",
          status: data.success ? "SUCCESS" : "FAILED",
          failureReason: data.error || null,
          createdAt: new Date().toISOString(),
          member: data.member
            ? {
                name: data.member.name,
                mobile: data.member.mobile,
                walletBalance: data.member.walletBalanceRupees * 100,
              }
            : null,
          details: data.details,
          action: data.action,
        };

        setActivityFeed((prev) => [newFeedItem, ...prev.slice(0, 24)]);
        
        if ((data.action as string) !== "REQUIRE_BOOKING") {
          triggerAutoDismiss();
        }
      } catch (err: any) {
        console.error("Kiosk scan resolution error:", err);
        if (soundEnabled) playNfcSound("error");

        const errorResponse: NfcCheckinResponse = {
          success: false,
          action: "REJECTED",
          message: "Unable to contact check-in server. Please verify network connection.",
          error: "NETWORK_ERROR",
        };
        setActiveResult(errorResponse);
        triggerAutoDismiss();
      } finally {
        setIsProcessing(false);
      }
    },
    [soundEnabled, triggerAutoDismiss]
  );

  // Hook up unified hardware NFC reader from Context
  const { isListening, subscribe, triggerSimulatedScan } = useNfc();

  useEffect(() => {
    const unsubscribe = subscribe(handleCardScan);
    return () => unsubscribe();
  }, [handleCardScan, subscribe]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUid.trim()) return;
    triggerSimulatedScan(manualUid.trim(), "SIMULATOR");
    setManualUid("");
  };

  return (
    <div className="h-full w-full bg-[#0f1117] text-white flex flex-col font-sans select-none overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* ========================================================================= */}
      {/* TOP STATUS BAR                                                            */}
      {/* ========================================================================= */}
      <header className="h-20 bg-[#161824] border-b border-[#2a2d3e] px-6 lg:px-10 flex items-center justify-between shadow-lg z-20 shrink-0">
        {/* Brand & Kiosk Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <FiShield className="text-2xl text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">SportsVilla</h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                KIOSK v2
              </span>
            </div>
            <p className="text-xs text-slate-400">Express Express Check-in Station</p>
          </div>
        </div>

        {/* Hardware Status Indicators */}
        <div className="hidden md:flex items-center gap-4 bg-[#1c1f2e] px-4 py-2 rounded-xl border border-[#2a2d3e]">
          {/* USB Keyboard Wedge Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">USB Wedge:</span>
            <span className="text-emerald-400 font-semibold">{isListening ? "Active" : "Offline"}</span>
          </div>

          <div className="h-4 w-[1px] bg-[#2a2d3e]" />

          {/* Audio Synthesizer Status */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
            title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
          >
            {soundEnabled ? (
              <FiVolume2 className="text-emerald-400 text-sm" />
            ) : (
              <FiVolumeX className="text-rose-400 text-sm" />
            )}
            <span>Audio {soundEnabled ? "On" : "Muted"}</span>
          </button>
        </div>

        {/* Live Clock & Fullscreen Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-base font-mono font-bold text-white tracking-wider flex items-center gap-2 justify-end">
              <FiClock className="text-orange-400 text-sm" />
              {currentTime || "00:00:00"}
            </div>
            <div className="text-[11px] text-slate-400">{currentDate}</div>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-[#1c1f2e] border border-[#2a2d3e] text-slate-300 hover:text-white hover:bg-[#25293d] transition shadow"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FiMinimize className="text-lg" /> : <FiMaximize className="text-lg" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN KIOSK VIEWPORT                                                       */}
      {/* ========================================================================= */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 lg:p-6 w-full overflow-hidden">
        {/* LEFT COLUMN: HERO TAP ZONE & QUICK TEST CONTROLS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          {/* Hero Tap Container / Booking Flow */}
          {isBookingMode ? (
            <KioskBookingFlow
              member={activeResult?.member || { id: "unknown", name: "Guest", walletBalanceRupees: 0 }}
              onComplete={() => {
                setIsBookingMode(false);
                // The booking flow will show a success message via useAlert
              }}
              onCancel={() => setIsBookingMode(false)}
            />
          ) : (
            <div className="flex-1 bg-gradient-to-b from-[#1c1f2e] to-[#141724] border-2 border-[#2a2d3e] rounded-3xl p-8 lg:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
              {/* Ambient Background Glows */}
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Radar / Concentric Pulse Animation */}
              <div className="relative mb-10 flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute w-72 h-72 rounded-full border border-orange-500/20 animate-ping duration-1000 pointer-events-none" />
                {/* Secondary expanding wave */}
                <div className="absolute w-60 h-60 rounded-full border border-orange-500/30 animate-pulse pointer-events-none" />
                {/* Inner glowing zone */}
                <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 p-[3px] shadow-[0_0_60px_rgba(249,115,22,0.35)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#161824] flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-[#1c1f2e] transition group">
                    <FiZap className="text-5xl text-orange-400 group-hover:scale-110 transition duration-300" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400/80">
                      {isProcessing ? "Processing..." : "Tap Card"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tap Instructions */}
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-3">
                TAP SPORTSVILLA CARD TO ENTER
              </h2>
              <p className="text-slate-400 max-w-lg text-base lg:text-lg mb-6 leading-relaxed">
                Hold your physical NFC card or bracelet near the reader. The kiosk will instantly verify your
                active court booking or membership pass.
              </p>

              {/* Supported Card Types Indicator Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-300">
                <span className="px-3 py-1.5 rounded-full bg-[#25293d] border border-[#34384e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Priority 1: Confirmed Bookings
                </span>
                <span className="px-3 py-1.5 rounded-full bg-[#25293d] border border-[#34384e] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Priority 2: Membership Attendance
                </span>
              </div>

              {/* Processing Spinner Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-[#0f1117]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-lg font-bold text-white tracking-wide">Verifying Card Access...</p>
                  <p className="text-sm font-mono text-orange-400 mt-1">UID: {lastScannedCardUid}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Testing & Simulator Fallback Panel (Hidden by default, Ctrl+Shift+N to toggle) */}
          {showSimulator && (
            <div className="bg-[#1c1f2e] border border-[#2a2d3e] rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400">
                  <FiRadio className="text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Manual Scanner & Simulator Tool</h3>
                  <p className="text-xs text-slate-400">Staff fallback for card number entry or testing</p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={manualUid}
                  onChange={(e) => setManualUid(e.target.value.toUpperCase())}
                  placeholder="Enter Card UID (e.g. 04A1B2C3)"
                  className="w-full sm:w-64 px-3.5 py-2 rounded-xl bg-[#141724] border border-[#2a2d3e] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!manualUid.trim() || isProcessing}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-sm font-bold text-white transition flex items-center gap-1.5 shadow-md shadow-orange-600/20 whitespace-nowrap"
                >
                  <span>Simulate</span>
                  <FiArrowRight />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE ACTIVITY FEED (4 COLS) */}
        <div className="lg:col-span-4 bg-[#1c1f2e] border border-[#2a2d3e] rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-[#2a2d3e] mb-4">
            <div className="flex items-center gap-2">
              <FiActivity className="text-orange-400 text-lg" />
              <h3 className="text-base font-bold text-white">Live Activity Feed</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#25293d] text-slate-300 border border-[#34384e]">
              {activityFeed.length} Scans
            </span>
          </div>

          {/* Scrollable Feed List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {activityFeed.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
                <FiZap className="text-3xl mb-2 opacity-40" />
                <p>No recent scans yet today</p>
                <p className="text-xs text-slate-600">Scans will stream here in real-time</p>
              </div>
            ) : (
              activityFeed.map((item) => {
                const isSuccess = item.status === "SUCCESS";
                const isBooking = item.action === "BOOKING_CHECKIN" || (item.type === "CHECKIN" && item.booking);
                const isMembership = item.action === "MEMBERSHIP_ATTENDANCE";
                const isDropin = item.action === "DROPIN_DEDUCTED" || item.type === "DROPIN";

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#161824] border border-[#25293d] hover:border-[#353a54] transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar / Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                          !isSuccess
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : isBooking
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : isMembership
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {!isSuccess ? (
                          <FiXCircle className="text-base" />
                        ) : isBooking ? (
                          <FiCalendar className="text-base" />
                        ) : isMembership ? (
                          <FiAward className="text-base" />
                        ) : (
                          <FiDollarSign className="text-base" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white truncate">
                            {item.member?.name || "Unassigned / Guest"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {!isSuccess
                            ? item.failureReason || "Access Rejected"
                            : isBooking
                            ? `Court Check-in: ${item.details?.sportName || item.booking?.sport?.name || "Booking"}`
                            : isMembership
                            ? `Membership: ${item.details?.membershipPlanName || "Valid Pass"}`
                            : "Drop-in Entry Fee Deducted"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-slate-500">[{item.cardUid}]</span>
                          <span className="text-[10px] text-slate-400">
                            {formatIST(item.createdAt, "hh:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 border ${
                        isSuccess
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* LARGE FULLSCREEN RESULT OVERLAY / MODAL                                   */}
      {/* ========================================================================= */}
      {activeResult && (
        <div
          onClick={dismissResult}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-10 cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-2xl w-full rounded-3xl p-8 lg:p-10 border-2 shadow-2xl flex flex-col text-center overflow-hidden cursor-default ${
              activeResult.success
                ? activeResult.action === "BOOKING_CHECKIN"
                  ? "bg-[#121f1a] border-emerald-500/50 shadow-emerald-950/50"
                  : activeResult.action === "MEMBERSHIP_ATTENDANCE"
                  ? "bg-[#121927] border-blue-500/50 shadow-blue-950/50"
                  : "bg-[#251b14] border-amber-500/50 shadow-amber-950/50"
                : "bg-[#251417] border-rose-500/50 shadow-rose-950/50"
            }`}
          >
            {/* Top Auto-dismiss Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-black/30">
              <div
                className={`h-full transition-all duration-75 ease-linear ${
                  activeResult.success
                    ? activeResult.action === "BOOKING_CHECKIN"
                      ? "bg-emerald-500"
                      : activeResult.action === "MEMBERSHIP_ATTENDANCE"
                      ? "bg-blue-500"
                      : "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${dismissProgress}%` }}
              />
            </div>

            {/* Top Icon Badge */}
            <div className="flex justify-center mb-6 mt-2">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-xl ${
                  activeResult.success
                    ? activeResult.action === "BOOKING_CHECKIN"
                      ? "bg-emerald-500 text-white shadow-emerald-500/30"
                      : activeResult.action === "MEMBERSHIP_ATTENDANCE"
                      ? "bg-blue-500 text-white shadow-blue-500/30"
                      : "bg-amber-500 text-white shadow-amber-500/30"
                    : "bg-rose-500 text-white shadow-rose-500/30"
                }`}
              >
                {activeResult.success ? (
                  activeResult.action === "BOOKING_CHECKIN" ? (
                    <FiCalendar className="text-5xl" />
                  ) : activeResult.action === "MEMBERSHIP_ATTENDANCE" ? (
                    <FiAward className="text-5xl" />
                  ) : (
                    <FiDollarSign className="text-5xl" />
                  )
                ) : (
                  <FiAlertTriangle className="text-5xl" />
                )}
              </div>
            </div>

            {/* Action Title Badge */}
            <div className="mb-2">
              <span
                className={`px-4 py-1.5 rounded-full text-xs lg:text-sm font-black uppercase tracking-wider border ${
                  activeResult.success
                    ? activeResult.action === "BOOKING_CHECKIN"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : activeResult.action === "MEMBERSHIP_ATTENDANCE"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                }`}
              >
                {activeResult.action === "BOOKING_CHECKIN"
                  ? "BOOKING CHECKED IN"
                  : activeResult.action === "MEMBERSHIP_ATTENDANCE"
                  ? "MEMBERSHIP ATTENDANCE MARKED"
                  : activeResult.action === "DROPIN_DEDUCTED"
                  ? "DROP-IN ENTRY GRANTED"
                  : "ACCESS DENIED"}
              </span>
            </div>

            {/* Member Name */}
            <h3 className="text-3xl lg:text-4xl font-black text-white mt-3 tracking-tight">
              {activeResult.member ? activeResult.member.name : "Unregistered Tag"}
            </h3>
            {activeResult.member?.mobile && (
              <p className="text-slate-400 text-sm mt-1">Mobile: +91 {activeResult.member.mobile}</p>
            )}

            {/* Result Message */}
            <p
              className={`mt-4 text-base lg:text-lg font-medium max-w-xl mx-auto ${
                activeResult.success ? "text-slate-200" : "text-rose-300"
              }`}
            >
              {activeResult.message}
            </p>

            {/* Action Button for Booking Mode */}
            {(activeResult.action as string) === "REQUIRE_BOOKING" && activeResult.member && (
              <div className="mt-8">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsBookingMode(true);
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white font-bold text-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 transition-all"
                >
                  Book Court Now
                </button>
              </div>
            )}

            {/* Structured Details Box */}
            {(activeResult.action as string) !== "REQUIRE_BOOKING" && (
              <div className="my-6 p-4 rounded-2xl bg-black/40 border border-white/10 grid grid-cols-2 gap-4 text-left">
                {activeResult.details?.courtName && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Court / Turf</span>
                    <p className="text-sm font-bold text-white">{activeResult.details.courtName}</p>
                  </div>
                )}
                {activeResult.details?.sportName && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Sport</span>
                    <p className="text-sm font-bold text-white">{activeResult.details.sportName}</p>
                  </div>
                )}
                {activeResult.details?.timeSlot && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Slot Time</span>
                    <p className="text-sm font-bold text-white">{activeResult.details.timeSlot}</p>
                  </div>
                )}
                {activeResult.details?.membershipPlanName && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Membership Plan</span>
                    <p className="text-sm font-bold text-white">{activeResult.details.membershipPlanName}</p>
                  </div>
                )}
                {activeResult.details?.dropInFeeRupees !== undefined && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Drop-in Fee</span>
                    <p className="text-sm font-bold text-amber-400">₹{activeResult.details.dropInFeeRupees}.00</p>
                  </div>
                )}
                {activeResult.member && (
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">Wallet Balance</span>
                    <p className="text-sm font-bold text-emerald-400">
                      ₹{activeResult.member.walletBalanceRupees.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action / Dismiss Button */}
            <button
              type="button"
              onClick={dismissResult}
              className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base transition border border-white/20 shadow-lg mt-2"
            >
              Done (Tap anywhere to close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
