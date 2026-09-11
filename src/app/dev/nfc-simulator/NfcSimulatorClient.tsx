"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Radio,
  Zap,
  Terminal,
  UserCheck,
  CreditCard,
  RefreshCw,
  Sparkles,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Ticket,
  Users,
  ShieldAlert,
  ChevronRight,
  Shuffle,
  Layers,
  Check,
  Copy,
} from "lucide-react";
import {
  generateRandomHexUid,
  simulateCustomEventTap,
  simulateKeyboardWedgeKeystrokes,
} from "@/lib/nfcSimulator";
import { playNfcSound } from "@/lib/soundUtils";
import { useAlert } from "@/components/AlertProvider";

interface NfcSimulatorClientProps {
  initialCards: any[];
  initialBookings: any[];
  initialTransactions: any[];
  initialMemberships: any[];
  initialAttendances: any[];
  stats: {
    totalCards: number;
    activeCards: number;
    blockedCards: number;
    totalTxCount: number;
  };
}

export function NfcSimulatorClient({
  initialCards,
  initialBookings,
  initialTransactions,
  initialMemberships,
  initialAttendances,
  stats,
}: NfcSimulatorClientProps) {
  const router = useRouter();
  const { showConfirm } = useAlert();

  const [activeTab, setActiveTab] = useState<"cards" | "bookings" | "memberships" | "transactions">(
    "cards"
  );
  const [customUid, setCustomUid] = useState<string>("04A1B2C301");
  const [customAmount, setCustomAmount] = useState<string>("50");
  const [customBookingId, setCustomBookingId] = useState<string>("");
  const [isStreamingWedge, setIsStreamingWedge] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [liveResponse, setLiveResponse] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Trigger CustomEvent Tap
  const handleTap = (uid: string) => {
    try {
      simulateCustomEventTap(uid, window, "SIMULATOR");
      playNfcSound("beep");
      setLiveResponse({
        action: "CUSTOM_EVENT_DISPATCHED",
        cardUid: uid,
        event: "nfc:tap & nfc-card-tap",
        deviceType: "SIMULATOR",
        timestamp: new Date().toISOString(),
      });
      notify(`Dispatched CustomEvent for ${uid}`);
    } catch (err: any) {
      notify(`Error: ${err.message}`);
    }
  };

  // 2. Trigger USB Keyboard Wedge Simulation
  const handleWedge = async (uid: string) => {
    if (isStreamingWedge) return;
    setIsStreamingWedge(true);
    try {
      const res = await simulateKeyboardWedgeKeystrokes(uid, window, 6);
      playNfcSound("beep");
      setLiveResponse({
        action: "KEYBOARD_WEDGE_STREAMED",
        cardUid: uid,
        characters: res.charCount,
        durationMs: res.durationMs,
        speed: "<15ms/char burst",
        terminator: "Enter",
        timestamp: new Date().toISOString(),
      });
      notify(`Streamed USB Wedge keystrokes for ${uid} in ${res.durationMs}ms`);
    } catch (err: any) {
      notify(`Error: ${err.message}`);
    } finally {
      setIsStreamingWedge(false);
    }
  };

  // 3. Trigger Direct Check-in API
  const handleCheckin = async (uid: string) => {
    setIsLoadingApi(true);
    try {
      const res = await fetch("/api/nfc/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardUid: uid,
          deviceType: "SIMULATOR",
          location: "QA_SIMULATOR_DASHBOARD",
        }),
      });
      const data = await res.json();
      setLiveResponse(data);
      if (data.success) {
        playNfcSound("success");
        notify(`Check-in Approved: ${data.action} (${data.message})`);
      } else {
        playNfcSound("error");
        notify(`Check-in Rejected: ${data.error || data.message}`);
      }
      router.refresh();
    } catch (err: any) {
      playNfcSound("error");
      notify(`Check-in API error: ${err.message}`);
    } finally {
      setIsLoadingApi(false);
    }
  };

  // 4. Trigger Direct Payment API
  const handlePayment = async (uid: string, amount: number, bookingId?: string) => {
    setIsLoadingApi(true);
    try {
      const res = await fetch("/api/nfc/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardUid: uid,
          amount,
          bookingId: bookingId || undefined,
          deviceType: "SIMULATOR",
          description: "QA Simulator Payment",
        }),
      });
      const data = await res.json();
      setLiveResponse(data);
      if (data.success) {
        playNfcSound("success");
        notify(`Payment Approved: ₹${data.deductedAmount} (Rem: ₹${data.remainingBalance})`);
      } else {
        playNfcSound("error");
        notify(`Payment Failed: ${data.error || data.code}`);
      }
      router.refresh();
    } catch (err: any) {
      playNfcSound("error");
      notify(`Payment API error: ${err.message}`);
    } finally {
      setIsLoadingApi(false);
    }
  };

  // 5. Seed Test Fixtures
  const handleSeedFixtures = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/nfc/simulator/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      if (data.success) {
        notify("Seeded 6 comprehensive QA testing fixtures into database!");
        router.refresh();
      } else {
        notify(`Seeding error: ${data.error}`);
      }
    } catch (err: any) {
      notify(`Seeding error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // 6. Clean Test Fixtures
  const handleCleanFixtures = async () => {
    showConfirm(
      "Confirm Clean",
      "Remove all simulator test fixtures created by the simulator?",
      async () => {
        setIsSeeding(true);
        try {
          const res = await fetch("/api/nfc/simulator/presets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "clean" }),
          });
          const data = await res.json();
          if (data.success) {
            notify("Cleaned simulator fixtures from database.");
            router.refresh();
          } else {
            notify(`Cleanup error: ${data.error}`);
          }
        } catch (err: any) {
          notify(`Cleanup error: ${err.message}`);
        } finally {
          setIsSeeding(false);
        }
      },
      undefined,
      "Clean",
      "Cancel",
      "error"
    );
  };

  const openFloatingPanel = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "N",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      })
    );
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                NFC Hardware Simulator & QA Lab
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold">
                M4 DEV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive test harness for dual-hardware kiosk check-in, keyboard wedge, and payment simulation.
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSeedFixtures}
            disabled={isSeeding}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
            title="Create cards and members for all 6 test cases"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSeeding ? "Seeding..." : "Seed 6 Test Fixtures"}</span>
          </button>

          <button
            onClick={handleCleanFixtures}
            disabled={isSeeding}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Clean simulator fixtures"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clean</span>
          </button>

          <button
            onClick={() => router.refresh()}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={openFloatingPanel}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-medium text-xs flex items-center gap-1.5 transition-all"
            title="Open floating developer simulator panel (Ctrl+Shift+N)"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Floating Panel</span>
            <span className="text-[10px] bg-black/40 px-1 rounded border border-amber-500/30 text-amber-200">
              Ctrl+Shift+N
            </span>
          </button>
        </div>
      </header>

      {/* Status Notice Toast */}
      {statusMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-amber-300 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-amber-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation & App Quick Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-300">Quick App Testing Links:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href="/admin/nfc/kiosk"
              target="_blank"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>Check-in Kiosk UI</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/admin/nfc/transactions"
              target="_blank"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>NFC Ledger</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/admin/nfc/assign"
              target="_blank"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>Card Assignment</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/play/book"
              target="_blank"
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>Customer Checkout</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Total Cards</p>
              <p className="text-xl font-bold text-white mt-0.5">{stats.totalCards}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Active Cards</p>
              <p className="text-xl font-bold text-emerald-400 mt-0.5">{stats.activeCards}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Blocked Cards</p>
              <p className="text-xl font-bold text-red-400 mt-0.5">{stats.blockedCards}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-mono">Total NFC Taps</p>
              <p className="text-xl font-bold text-amber-400 mt-0.5">{stats.totalTxCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Interactive Manual Simulator Console */}
        <section className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold tracking-wide text-white">Manual Hardware Console</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Direct Hardware Bus & API Dispatcher
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Card UID Input */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Card UID (Hex):</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customUid}
                  onChange={(e) => setCustomUid(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. 04A1B2C3"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-amber-300 text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => setCustomUid(generateRandomHexUid(8))}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                  title="Generate Random Hex"
                >
                  <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                </button>
                <button
                  onClick={() => handleCopy(customUid)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300"
                  title="Copy UID"
                >
                  {copiedUid ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Payment Amount */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Payment Amount (₹):</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Optional Booking ID */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Booking ID (Optional):</label>
              <input
                type="text"
                value={customBookingId}
                onChange={(e) => setCustomBookingId(e.target.value.trim())}
                placeholder="Optional bookingId"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => handleTap(customUid)}
              className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Tap (Event)</span>
            </button>

            <button
              onClick={() => handleWedge(customUid)}
              disabled={isStreamingWedge}
              className="px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              <Terminal className={`w-4 h-4 ${isStreamingWedge ? "animate-pulse" : ""}`} />
              <span>{isStreamingWedge ? "Streaming..." : "Simulate Wedge (USB)"}</span>
            </button>

            <button
              onClick={() => handleCheckin(customUid)}
              disabled={isLoadingApi}
              className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              <span>POST /api/nfc/checkin</span>
            </button>

            <button
              onClick={() =>
                handlePayment(
                  customUid,
                  parseFloat(customAmount) || 50,
                  customBookingId || undefined
                )
              }
              disabled={isLoadingApi}
              className="px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>POST /api/nfc/pay</span>
            </button>
          </div>

          {/* Live Response Card */}
          {liveResponse && (
            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mt-3">
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Response Inspector:</span>
                <span
                  className={`font-semibold ${
                    liveResponse.success || liveResponse.action === "CUSTOM_EVENT_DISPATCHED"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {liveResponse.action ||
                    liveResponse.status ||
                    (liveResponse.success ? "SUCCESS" : "FAILED")}
                </span>
              </div>
              <pre className="p-3 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(liveResponse, null, 2)}
              </pre>
            </div>
          )}
        </section>

        {/* Database Explorer Tabs */}
        <section className="space-y-4">
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab("cards")}
              className={`px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "cards"
                  ? "border-amber-400 text-amber-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>NFC Cards Inventory ({initialCards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "bookings"
                  ? "border-amber-400 text-amber-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Today&apos;s Bookings & Tickets ({initialBookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("memberships")}
              className={`px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "memberships"
                  ? "border-amber-400 text-amber-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Memberships & Attendance ({initialMemberships.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-4 py-2.5 font-medium text-xs sm:text-sm border-b-2 flex items-center gap-2 transition-all ${
                activeTab === "transactions"
                  ? "border-amber-400 text-amber-400 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Recent Transactions ({initialTransactions.length})</span>
            </button>
          </div>

          {/* TAB 1: NFC Cards Inventory */}
          {activeTab === "cards" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Card UID / Label</th>
                      <th className="p-3">Assigned Member</th>
                      <th className="p-3">Wallet Balance</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Taps</th>
                      <th className="p-3">Last Used</th>
                      <th className="p-3 text-right">Quick Simulation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {initialCards.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                          No NFC cards found. Click &ldquo;Seed 6 Test Fixtures&rdquo; in the top bar to
                          generate test cards.
                        </td>
                      </tr>
                    ) : (
                      initialCards.map((card) => {
                        const balanceRupees = card.member?.walletBalance
                          ? (card.member.walletBalance / 100).toFixed(2)
                          : "0.00";
                        return (
                          <tr key={card.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                                <span>{card.cardUid}</span>
                                {card.cardId && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    ({card.cardId})
                                  </span>
                                )}
                              </div>
                              {card.notes && (
                                <p className="text-[10px] text-slate-400 font-sans truncate max-w-xs">
                                  {card.notes}
                                </p>
                              )}
                            </td>

                            <td className="p-3 font-sans">
                              {card.member ? (
                                <div>
                                  <span className="font-semibold text-slate-200">
                                    {card.member.name}
                                  </span>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {card.member.mobile}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">Unassigned</span>
                              )}
                            </td>

                            <td className="p-3">
                              <span
                                className={`font-semibold ${
                                  parseFloat(balanceRupees) > 50
                                    ? "text-emerald-400"
                                    : "text-amber-400"
                                }`}
                              >
                                ₹{balanceRupees}
                              </span>
                              {card.member && (
                                <p className="text-[10px] text-slate-500">
                                  {card.member.loyaltyPoints || 0} pts
                                </p>
                              )}
                            </td>

                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  card.status === "ACTIVE"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {card.status}
                              </span>
                            </td>

                            <td className="p-3 text-slate-300">
                              {card._count?.transactions || 0}
                            </td>

                            <td className="p-3 text-slate-400 text-[11px]">
                              {card.lastUsedAt
                                ? new Date(card.lastUsedAt).toLocaleTimeString()
                                : "Never"}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 font-sans">
                                <button
                                  onClick={() => handleTap(card.cardUid)}
                                  className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-medium transition-colors"
                                  title="Emit window CustomEvent"
                                >
                                  Tap
                                </button>
                                <button
                                  onClick={() => handleWedge(card.cardUid)}
                                  disabled={isStreamingWedge}
                                  className="px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                  title="Stream USB keystrokes"
                                >
                                  Wedge
                                </button>
                                <button
                                  onClick={() => handleCheckin(card.cardUid)}
                                  disabled={isLoadingApi}
                                  className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                  title="Call POST /api/nfc/checkin"
                                >
                                  Check-in
                                </button>
                                <button
                                  onClick={() => handlePayment(card.cardUid, 50)}
                                  disabled={isLoadingApi}
                                  className="px-2 py-1 rounded bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                  title="Call POST /api/nfc/pay for ₹50"
                                >
                                  Pay ₹50
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Today's Bookings & Tickets */}
          {activeTab === "bookings" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Booking ID</th>
                      <th className="p-3">Member</th>
                      <th className="p-3">Sport / Court</th>
                      <th className="p-3">Slot Time</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Ticket QR & Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {initialBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                          No bookings scheduled for today. Click &ldquo;Seed 6 Test Fixtures&rdquo; to
                          generate a test booking.
                        </td>
                      </tr>
                    ) : (
                      initialBookings.map((b) => {
                        const ticket = b.tickets && b.tickets[0];
                        return (
                          <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-semibold text-slate-200">{b.id}</td>
                            <td className="p-3 font-sans">
                              <span className="font-semibold text-slate-200">
                                {b.member?.name}
                              </span>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {b.member?.mobile}
                              </p>
                            </td>
                            <td className="p-3 font-sans text-slate-300">
                              {b.sport?.name} - {b.turf?.name}
                            </td>
                            <td className="p-3 text-slate-300">
                              {new Date(b.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(b.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.paymentStatus === "PAID"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {b.paymentStatus} (₹{b.price})
                              </span>
                            </td>
                            <td className="p-3">
                              {ticket ? (
                                <div className="space-y-0.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      ticket.status === "CHECKED_IN"
                                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    }`}
                                  >
                                    {ticket.status}
                                  </span>
                                  <p className="text-[10px] text-slate-400">{ticket.qrCode}</p>
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">No Ticket</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setCustomBookingId(b.id)}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans text-[11px]"
                              >
                                Load ID
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Memberships & Attendance */}
          {activeTab === "memberships" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Memberships */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Active Member Memberships
                </h3>
                <div className="space-y-2">
                  {initialMemberships.length === 0 ? (
                    <p className="text-xs text-slate-500 font-sans">No active memberships found.</p>
                  ) : (
                    initialMemberships.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">{m.member?.name}</p>
                          <p className="text-slate-400 text-[10px] font-mono">
                            Plan: {m.membershipPlan?.name} (Daily Slots:{" "}
                            {m.membershipPlan?.slotsPerDay})
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                          ACTIVE
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Today's Attendance Records */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Today&apos;s Attendance Records
                </h3>
                <div className="space-y-2">
                  {initialAttendances.length === 0 ? (
                    <p className="text-xs text-slate-500 font-sans">No attendance logged today.</p>
                  ) : (
                    initialAttendances.map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-200">{a.member?.name}</p>
                          <p className="text-slate-400 text-[10px] font-mono">
                            Plan: {a.membershipPlan?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
                            PRESENT
                          </span>
                          <p className="text-slate-500 text-[10px] font-mono mt-0.5">
                            {new Date(a.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Recent NFC Transactions Ledger */}
          {activeTab === "transactions" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Card UID</th>
                      <th className="p-3">Member</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Device</th>
                      <th className="p-3">Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {initialTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                          No transactions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      initialTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-slate-400 text-[11px]">
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-3 font-bold text-amber-300">{tx.cardUid}</td>
                          <td className="p-3 font-sans text-slate-200">
                            {tx.member?.name || (
                              <span className="text-slate-500 italic">None</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.status === "SUCCESS"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-200">
                            ₹{(tx.amount || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">{tx.deviceType}</td>
                          <td className="p-3 text-red-400 text-[11px]">
                            {tx.failureReason || <span className="text-slate-600">-</span>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
