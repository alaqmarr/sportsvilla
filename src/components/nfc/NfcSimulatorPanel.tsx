"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Radio,
  Zap,
  Volume2,
  VolumeX,
  X,
  Shuffle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  ExternalLink,
  CreditCard,
  UserCheck,
  Ban,
  HelpCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  NfcSimulatorPreset,
  NfcSimulationLogEntry,
  NfcSimulatorMode,
  NfcCheckinResponse,
  NfcPaymentResponse,
} from "@/types/nfc";
import {
  generateRandomHexUid,
  simulateCustomEventTap,
  simulateKeyboardWedgeKeystrokes,
  DEFAULT_PRESET_CARDS,
} from "@/modules/nfc/nfc-simulator.lib";
import { playNfcSound } from "@/core/utils/soundUtils";

export function NfcSimulatorPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [presets, setPresets] = useState<NfcSimulatorPreset[]>(DEFAULT_PRESET_CARDS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-active-booking");
  const [cardUid, setCardUid] = useState<string>("04A1B2C301");
  const [paymentAmount, setPaymentAmount] = useState<string>("50");
  const [customBookingId, setCustomBookingId] = useState<string>("");
  const [isStreamingWedge, setIsStreamingWedge] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [latestResponse, setLatestResponse] = useState<any | null>(null);
  const [history, setHistory] = useState<NfcSimulationLogEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // 1. Hotkey Listener: Ctrl + Shift + N or ` (backtick)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + N
      if (e.ctrlKey && e.shiftKey && (e.key === "N" || e.key === "n")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // ` (backtick) or ~ when not editing text in inputs
      if (e.key === "`" || e.key === "~") {
        const active = document.activeElement;
        const isEditing =
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            (active as HTMLElement).isContentEditable);
        if (!isEditing) {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 2. Load audio preference & presets from API
  const fetchPresets = useCallback(async () => {
    try {
      const res = await fetch("/api/nfc/simulator/presets");
      if (res.ok) {
        const data = await res.json();
        if (data.presets && Array.isArray(data.presets)) {
          setPresets(data.presets);
          const first = data.presets[0];
          if (first && !cardUid) {
            setSelectedPresetId(first.id);
            setCardUid(first.cardUid);
          }
        }
      }
    } catch {
      // Fallback to default presets
      setPresets(DEFAULT_PRESET_CARDS);
    }
  }, [cardUid]);

  useEffect(() => {
    fetchPresets();
    const savedAudio = localStorage.getItem("sportsvilla_sim_audio");
    if (savedAudio !== null) {
      setIsAudioEnabled(savedAudio === "true");
    }
  }, [fetchPresets]);

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("sportsvilla_sim_audio", String(next));
      return next;
    });
  };

  const notifyFeedback = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // Add entry to history log
  const recordLog = (
    mode: NfcSimulatorMode,
    uid: string,
    status: NfcSimulationLogEntry["status"],
    summary: string,
    payload?: any,
    durationMs?: number
  ) => {
    const entry: NfcSimulationLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      mode,
      cardUid: uid,
      status,
      summary,
      payload,
      durationMs,
    };
    setHistory((prev) => [entry, ...prev.slice(0, 19)]);
  };

  // 3. Preset selection handler
  const handleSelectPreset = (preset: NfcSimulatorPreset) => {
    setSelectedPresetId(preset.id);
    setCardUid(preset.cardUid);
    notifyFeedback(`Selected preset: ${preset.name}`);
  };

  // 4. Random Hex Generator
  const handleGenerateRandomUid = () => {
    const newUid = generateRandomHexUid(8);
    setCardUid(newUid);
    setSelectedPresetId("");
    notifyFeedback(`Generated Mock UID: ${newUid}`);
  };

  const handleCopyUid = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cardUid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 1500);
    }
  };

  // 5. Simulation Mode A: CustomEvent Tap
  const handleSimulateCustomEvent = () => {
    if (!cardUid.trim()) return;
    try {
      simulateCustomEventTap(cardUid, window, "SIMULATOR");
      if (isAudioEnabled) playNfcSound("beep");

      recordLog(
        "CUSTOM_EVENT",
        cardUid,
        "DISPATCHED",
        "Dispatched window 'nfc:tap' & 'nfc-card-tap' CustomEvents"
      );
      setLatestResponse({
        mode: "CUSTOM_EVENT",
        event: "nfc:tap & nfc-card-tap",
        cardUid,
        deviceType: "SIMULATOR",
        status: "DISPATCHED_TO_WINDOW",
        timestamp: new Date().toISOString(),
      });
      notifyFeedback(`Dispatched CustomEvent for ${cardUid}`);
    } catch (err: any) {
      recordLog("CUSTOM_EVENT", cardUid, "FAILED", err.message);
    }
  };

  // 6. Simulation Mode B: USB Keyboard Wedge (<15ms per char)
  const handleSimulateKeyboardWedge = async () => {
    if (!cardUid.trim() || isStreamingWedge) return;
    setIsStreamingWedge(true);
    try {
      const result = await simulateKeyboardWedgeKeystrokes(cardUid, window, 6);
      if (isAudioEnabled) playNfcSound("beep");

      recordLog(
        "KEYBOARD_WEDGE",
        cardUid,
        "STREAMED",
        `Streamed ${result.charCount} keystrokes in ${result.durationMs}ms ending in Enter`,
        result,
        result.durationMs
      );
      setLatestResponse({
        mode: "KEYBOARD_WEDGE",
        cardUid,
        keystrokesSent: result.charCount,
        durationMs: result.durationMs,
        speed: "<15ms/char burst",
        terminator: "Enter",
        timestamp: new Date().toISOString(),
      });
      notifyFeedback(`Streamed USB Wedge keystrokes for ${cardUid}`);
    } catch (err: any) {
      recordLog("KEYBOARD_WEDGE", cardUid, "FAILED", err.message);
    } finally {
      setIsStreamingWedge(false);
    }
  };

  // 7. Simulation Mode C: Direct Test Check-in
  const handleDirectCheckin = async () => {
    if (!cardUid.trim() || isLoadingApi) return;
    setIsLoadingApi(true);
    const startTime = Date.now();
    try {
      const res = await fetch("/api/nfc/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardUid,
          deviceType: "SIMULATOR",
          location: "DEV_SIMULATOR_PANEL",
        }),
      });

      const data: NfcCheckinResponse = await res.json();
      const duration = Date.now() - startTime;
      setLatestResponse(data);

      if (data.success) {
        if (isAudioEnabled) playNfcSound("success");
        recordLog(
          "DIRECT_CHECKIN",
          cardUid,
          "SUCCESS",
          `Check-in approved: ${data.action} - ${data.message}`,
          data,
          duration
        );
        notifyFeedback(`Check-in Approved: ${data.action}`);
      } else {
        if (isAudioEnabled) playNfcSound("error");
        recordLog(
          "DIRECT_CHECKIN",
          cardUid,
          "REJECTED",
          `Check-in rejected: ${data.error || data.message}`,
          data,
          duration
        );
        notifyFeedback(`Check-in Rejected: ${data.error || data.message}`);
      }
    } catch (err: any) {
      if (isAudioEnabled) playNfcSound("error");
      recordLog("DIRECT_CHECKIN", cardUid, "FAILED", err.message);
      setLatestResponse({ error: err.message, status: "NETWORK_ERROR" });
    } finally {
      setIsLoadingApi(false);
    }
  };

  // 8. Simulation Mode D: Direct Test Payment
  const handleDirectPayment = async () => {
    if (!cardUid.trim() || isLoadingApi) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      notifyFeedback("Please enter a valid payment amount > 0");
      return;
    }

    setIsLoadingApi(true);
    const startTime = Date.now();
    try {
      const res = await fetch("/api/nfc/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardUid,
          amount: amt,
          bookingId: customBookingId.trim() || undefined,
          deviceType: "SIMULATOR",
          description: "Simulated hardware card payment",
        }),
      });

      const data: NfcPaymentResponse = await res.json();
      const duration = Date.now() - startTime;
      setLatestResponse(data);

      if (data.success) {
        if (isAudioEnabled) playNfcSound("success");
        recordLog(
          "DIRECT_PAYMENT",
          cardUid,
          "SUCCESS",
          `Paid ₹${data.deductedAmount}. Rem: ₹${data.remainingBalance}`,
          data,
          duration
        );
        notifyFeedback(`Payment of ₹${data.deductedAmount} Successful!`);
      } else {
        if (isAudioEnabled) playNfcSound("error");
        recordLog(
          "DIRECT_PAYMENT",
          cardUid,
          "REJECTED",
          `Payment failed: ${data.error || data.code}`,
          data,
          duration
        );
        notifyFeedback(`Payment Failed: ${data.error || data.code}`);
      }
    } catch (err: any) {
      if (isAudioEnabled) playNfcSound("error");
      recordLog("DIRECT_PAYMENT", cardUid, "FAILED", err.message);
      setLatestResponse({ error: err.message, status: "NETWORK_ERROR" });
    } finally {
      setIsLoadingApi(false);
    }
  };

  // 9. Seed Test Fixtures
  const handleSeedFixtures = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/nfc/simulator/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      if (res.ok) {
        await fetchPresets();
        notifyFeedback("Database fixtures seeded successfully!");
      } else {
        notifyFeedback("Failed to seed fixtures");
      }
    } catch (err: any) {
      notifyFeedback(`Seeding error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const selectedPreset = presets.find((p) => p.id === selectedPresetId);

  return (
    <>
      {/* Floating Developer Pill Button (Bottom Right) */}
      <aside
        aria-label="NFC Hardware Simulator Controls"
        className="fixed bottom-4 right-4 z-50 flex items-center"
      >
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-200 text-xs font-mono font-medium ${
            isOpen
              ? "bg-amber-500 text-slate-950 border-amber-400 font-semibold ring-2 ring-amber-400/30"
              : "bg-slate-900/90 text-amber-400 border-amber-500/40 hover:bg-slate-800 hover:border-amber-400"
          }`}
          title="Toggle NFC Hardware Simulator (Ctrl+Shift+N or `)"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-current" />
          <span>NFC Sim</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 border border-white/10 text-slate-300">
            `
          </span>
        </button>
      </aside>

      {/* Main Floating Simulator Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-14 right-4 z-50 w-96 sm:w-[440px] max-h-[88vh] flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 overflow-hidden text-xs"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="font-semibold text-slate-200 tracking-wide">
                NFC Hardware Simulator
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                DEV
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleAudio}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                  isAudioEnabled ? "text-emerald-400" : "text-slate-500"
                }`}
                title={isAudioEnabled ? "Audio Effects ON" : "Audio Effects Muted"}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <a
                href="/dev/nfc-simulator"
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Open Dedicated Testing Lab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* Feedback Alert Banner */}
            {feedbackNotice && (
              <div className="px-2.5 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-[11px] animate-fadeIn flex items-center justify-between">
                <span>{feedbackNotice}</span>
                <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              </div>
            )}

            {/* Presets Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 font-medium">
                <span>Preset Test Cards:</span>
                <button
                  onClick={handleSeedFixtures}
                  disabled={isSeeding}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline font-mono"
                  title="Create or reset test cards in database"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isSeeding ? "animate-spin" : ""}`} />
                  {isSeeding ? "Seeding..." : "Seed Fixtures"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {presets.map((preset) => {
                  const isSelected = preset.cardUid === cardUid;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2 py-1.5 rounded-lg border text-left flex flex-col transition-all ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/60 text-amber-200 font-medium"
                          : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate font-semibold text-[11px]">
                          {preset.name.replace("Member with ", "").replace("Active ", "")}
                        </span>
                        {preset.category === "BLOCKED_CARD" ? (
                          <Ban className="w-3 h-3 text-red-400 shrink-0" />
                        ) : preset.category === "UNREGISTERED_CARD" ? (
                          <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 truncate">
                        {preset.cardUid}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Preset Info */}
              {selectedPreset && (
                <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-slate-200">
                      {selectedPreset.memberName || "Preset Card"}
                    </span>
                    {selectedPreset.walletBalanceRupees !== undefined && (
                      <span className="font-mono text-emerald-400 font-medium">
                        ₹{selectedPreset.walletBalanceRupees.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    {selectedPreset.description}
                  </p>
                </div>
              )}
            </div>

            {/* Mock UID Input & Hex Generator */}
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Hardware Card UID (Hex):</label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={cardUid}
                    onChange={(e) => setCardUid(e.target.value.toUpperCase().trim())}
                    placeholder="e.g. 04A1B2C3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-amber-300 tracking-wider text-xs focus:outline-none focus:border-amber-400"
                  />
                  <CreditCard className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-500 pointer-events-none" />
                </div>

                <button
                  onClick={handleGenerateRandomUid}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition-colors"
                  title="Generate Random Hex UID"
                >
                  <Shuffle className="w-3 h-3 text-amber-400" />
                  <span>Random</span>
                </button>

                <button
                  onClick={handleCopyUid}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
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

            {/* Direct Payment Parameters */}
            <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/50 space-y-1.5">
              <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">
                Direct Payment Options
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 text-[10px]">Amount (₹):</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px]">Booking ID (Opt):</label>
                  <input
                    type="text"
                    value={customBookingId}
                    onChange={(e) => setCustomBookingId(e.target.value)}
                    placeholder="Optional ID"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200 text-xs focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Action Buttons */}
            <div className="space-y-1.5">
              <span className="text-slate-400 font-medium">Trigger Hardware Actions:</span>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. CustomEvent Tap */}
                <button
                  onClick={handleSimulateCustomEvent}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulate Tap</span>
                </button>

                {/* 2. Keyboard Wedge */}
                <button
                  onClick={handleSimulateKeyboardWedge}
                  disabled={isStreamingWedge}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  <Terminal className={`w-3.5 h-3.5 ${isStreamingWedge ? "animate-pulse" : ""}`} />
                  <span>{isStreamingWedge ? "Streaming..." : "USB Wedge"}</span>
                </button>

                {/* 3. Direct Check-in */}
                <button
                  onClick={handleDirectCheckin}
                  disabled={isLoadingApi}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Check-in (API)</span>
                </button>

                {/* 4. Direct Payment */}
                <button
                  onClick={handleDirectPayment}
                  disabled={isLoadingApi}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹{paymentAmount}</span>
                </button>
              </div>
            </div>

            {/* Live Response Inspector */}
            {latestResponse && (
              <div className="rounded-lg bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 border-b border-slate-800 font-mono text-[10px]">
                  <span className="text-slate-400">Live Simulator Response</span>
                  <span
                    className={`font-semibold ${
                      latestResponse.success || latestResponse.status === "DISPATCHED_TO_WINDOW"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {latestResponse.action ||
                      latestResponse.status ||
                      (latestResponse.success ? "SUCCESS" : "ERROR")}
                  </span>
                </div>
                <pre className="p-2 text-[10px] font-mono text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap break-all leading-tight">
                  {JSON.stringify(latestResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Live History Toggle */}
            <div className="space-y-1">
              <button
                onClick={() => setShowHistory((prev) => !prev)}
                className="w-full flex items-center justify-between px-2.5 py-1 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 rounded-lg text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Simulation History ({history.length})</span>
                </div>
                {showHistory ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showHistory && (
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                  {history.length === 0 ? (
                    <div className="text-center py-2 text-slate-500">No simulations run yet.</div>
                  ) : (
                    history.map((item) => (
                      <div
                        key={item.id}
                        className="p-1.5 rounded bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-1"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`px-1 rounded text-[9px] font-bold ${
                              item.status === "SUCCESS" || item.status === "DISPATCHED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : item.status === "STREAMED"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {item.status}
                          </span>
                          <span className="text-slate-300 truncate">{item.summary}</span>
                        </div>
                        <span className="text-slate-500 text-[9px] shrink-0">{item.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-3.5 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>
              Hotkey: <span className="text-amber-400">Ctrl+Shift+N</span> or{" "}
              <span className="text-amber-400">`</span>
            </span>
            <span className="text-slate-400">SportsVilla M4</span>
          </div>
        </div>
      )}
    </>
  );
}
