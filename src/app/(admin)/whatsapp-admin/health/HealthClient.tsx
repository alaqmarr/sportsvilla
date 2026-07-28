"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiPhoneCall,
  FiUsers,
  FiActivity,
  FiShield,
  FiToggleRight,
  FiToggleLeft,
  FiSave,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiCornerUpLeft,
  FiRefreshCw,
  FiSmartphone
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";

const DEFAULT_INTRO = `Welcome to *SportsVilla*! 🏆\nThank you for reaching out. Our automated sports booking & tournament platform is currently in active beta.\n\nFor immediate assistance, booking inquiries, or support, please contact Alaqmar directly:\n📞 *Phone / WhatsApp*: +91 9618443558\n🌐 *Website*: https://sportsvilla.co.in\n\nWe will get back to you shortly!`;

export default function HealthClient({ initialHealthData, initialAutoReply }: { initialHealthData: any, initialAutoReply: any }) {
  const [healthData, setHealthData] = useState<any | null>(initialHealthData);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(initialAutoReply?.enabled ?? true);
  const [autoReplyMessage, setAutoReplyMessage] = useState(initialAutoReply?.message ?? DEFAULT_INTRO);
  const [autoReplyCooldown, setAutoReplyCooldown] = useState(initialAutoReply?.cooldownMinutes ?? 10);
  const [savingConfig, setSavingConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const greetingTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
      case "DELIVERED":
      case "READ":
      case "SENT":
      case "GREEN":
      case "CONNECTED":
      case "ONLINE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><FiCheckCircle /> {status}</span>;
      case "PENDING":
      case "YELLOW":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><FiClock /> {status}</span>;
      case "REJECTED":
      case "FAILED":
      case "RED":
      case "OFFLINE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><FiAlertCircle /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">{status || "UNKNOWN"}</span>;
    }
  };

  const fetchConfigAndHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/client/v1/whatsapp/config");
      const data = await res.json();
      if (data.success) {
        setHealthData(data.health);
        setAutoReplyEnabled(data.autoReply.enabled);
        setAutoReplyMessage(data.autoReply.message);
        setAutoReplyCooldown(data.autoReply.cooldownMinutes);
      } else {
        toast.error(data.error || "Could not fetch WhatsApp health status");
      }
    } catch (err: any) {
      console.error("Error fetching config/health", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If the server-side fetch passed down an error, display it immediately
    if (initialHealthData?.metaApiError) {
      toast.error(initialHealthData.metaApiError);
    }
  }, [initialHealthData]);

  const handleSaveAutoReplyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingConfig) return;
    setSavingConfig(true);
    try {
      const res = await fetch("/api/client/v1/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: autoReplyEnabled,
          message: autoReplyMessage,
          cooldownMinutes: autoReplyCooldown,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Auto-Reply setting saved successfully!");
        await fetchConfigAndHealth();
      } else {
        toast.error(`Save failed: ${data.error}`);
      }
    } catch (err: any) {
      toast.error("Error saving Auto-Reply configuration");
    } finally {
      setSavingConfig(false);
    }
  };

  const renderWhatsAppRichText = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, lIdx) => {
      let html = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*(.*?)\*/g, '<strong class="font-bold text-white">$1</strong>')
        .replace(/_(.*?)_/g, '<em class="italic text-gray-200">$1</em>')
        .replace(/~(.*?)~/g, '<del class="line-through text-gray-400">$1</del>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>');
      return (
        <div key={lIdx} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} className="min-h-[1em]" />
      );
    });
  };

  const applyGreetingFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = greetingTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = autoReplyMessage.substring(start, end) || "text";
    const newText =
      autoReplyMessage.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      autoReplyMessage.substring(end);
    setAutoReplyMessage(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 10);
  };

  const insertGreetingEmoji = (emoji: string) => {
    const textarea = greetingTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      autoReplyMessage.substring(0, start) +
      emoji +
      autoReplyMessage.substring(end);
    setAutoReplyMessage(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  };

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#0b141a] overflow-hidden text-gray-200">
      {/* Header */}
      <div className="h-16 shrink-0 bg-[#202c33] border-b border-[#2a3942] px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/whatsapp-admin" className="p-2 hover:bg-[#2a3942] rounded-full transition-colors text-gray-300">
            <FiCornerUpLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">WhatsApp Health & Auto-Reply</h1>
            <p className="text-xs text-gray-400">Manage Meta API status and custom greetings</p>
          </div>
        </div>
        <button
          onClick={fetchConfigAndHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#2a3942] hover:bg-[#374b57] rounded-lg text-sm transition-colors"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto space-y-6 w-full">
        {/* Top Row: 4 Live Health Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Meta Connection Status */}
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta API Connection</span>
              <FiSmartphone className="text-emerald-400 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-sans tracking-wide">
                {healthData?.metaPhoneInfo?.display_phone_number || "UNKNOWN"}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                {healthData?.metaPhoneInfo?.verified_name || "UNKNOWN"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2a2d3e] flex items-center justify-between text-xs">
              <span className="text-gray-400">Quality:</span>
              {getStatusBadge(healthData?.metaPhoneInfo?.quality_rating || "UNKNOWN")}
            </div>
          </div>

          {/* Card 2: Active Numbers & DB Health */}
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Numbers & DB</span>
              <FiUsers className="text-blue-400 text-lg" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white font-sans">
                {healthData?.database?.stats?.activeNumbersCount ?? 0}
              </h3>
              <p className="text-xs text-gray-300 mt-1">Unique customer WhatsApp numbers</p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2a2d3e] flex items-center justify-between text-xs">
              <span className="text-gray-400">Database:</span>
              <span className="text-emerald-400 font-bold font-sans">sqlite (ONLINE)</span>
            </div>
          </div>

          {/* Card 3: Messaging Limit & Delivery Rate */}
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Messaging Limit Tier</span>
              <FiActivity className="text-purple-400 text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white font-sans">
                {healthData?.metaPhoneInfo?.messaging_limit_tier || "UNKNOWN"}
              </h3>
              <p className="text-xs text-gray-300 mt-1">
                Total Msgs Processed: {healthData?.database?.stats?.totalMessages ?? 0}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2a2d3e] flex items-center justify-between text-xs">
              <span className="text-gray-400">Account Mode:</span>
              <span className={`font-bold ${healthData?.metaPhoneInfo?.account_mode === "LIVE" ? "text-emerald-400" : "text-gray-400"}`}>
                {healthData?.metaPhoneInfo?.account_mode || "UNKNOWN"}
              </span>
            </div>
          </div>

          {/* Card 4: Webhook & Environment Tokens */}
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Meta API Tokens</span>
              <FiShield className="text-amber-400 text-lg" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {healthData?.metaApiError ? "⚠️ Verify Tokens" : "🔒 All Tokens Valid"}
              </h3>
              <p className="text-[11px] text-gray-400 mt-1 truncate">
                {healthData?.metaApiError || "Meta Graph API v21.0 Connected"}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2a2d3e] flex items-center justify-between text-xs">
              <span className="text-gray-400">Webhook Hits:</span>
              <span className="text-orange-400 font-bold font-sans">
                {healthData?.database?.stats?.webhookLogsCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Auto-Reply Greeting Customizer + Live Phone Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Col (7 cols): Greeting Customizer Editor */}
          <div className="lg:col-span-7 bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2a2d3e] pb-4">
              <div>
                <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                  <FaWhatsapp className="text-[#25D366] text-lg" /> WhatsApp Auto-Reply & Greeting Customizer
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Configure the greeting message sent automatically when a customer messages &ldquo;hello&rdquo; or contacts SportsVilla
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#202433] hover:bg-[#2a2d3e] text-xs font-bold text-white transition-colors"
              >
                {autoReplyEnabled ? (
                  <>
                    <FiToggleRight className="text-emerald-400 text-xl" /> <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <FiToggleLeft className="text-gray-500 text-xl" /> <span className="text-gray-400">Disabled</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSaveAutoReplyConfig} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-200">
                    Greeting Message Template
                  </label>
                  <span className="text-xs text-gray-400 font-sans">
                    Select text and click B / I / S to format
                  </span>
                </div>

                {/* WhatsApp Rich Text & Emoji Toolbar */}
                <div className="flex items-center justify-between bg-[#0f1117] border border-b-0 border-[#2a2d3e] rounded-t-xl px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyGreetingFormatting("*")}
                      className="w-7 h-7 rounded-lg bg-[#181c28] hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-200 font-bold text-xs flex items-center justify-center transition-all border border-[#2a2d3e]"
                      title="Bold (*text*)"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => applyGreetingFormatting("_")}
                      className="w-7 h-7 rounded-lg bg-[#181c28] hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-200 italic font-serif text-xs flex items-center justify-center transition-all border border-[#2a2d3e]"
                      title="Italics (_text_)"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => applyGreetingFormatting("~")}
                      className="w-7 h-7 rounded-lg bg-[#181c28] hover:bg-[#25D366]/20 hover:text-[#25D366] text-gray-200 line-through text-xs flex items-center justify-center transition-all border border-[#2a2d3e]"
                      title="Strikethrough (~text~)"
                    >
                      S
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {["🏆", "⚽", "🏏", "👋", "📍", "📞"].map((emoji, eIdx) => (
                      <button
                        key={eIdx}
                        type="button"
                        onClick={() => insertGreetingEmoji(emoji)}
                        className="w-7 h-7 rounded-lg bg-[#181c28] hover:bg-[#2a2d3e] text-sm flex items-center justify-center transition-all border border-[#2a2d3e]"
                        title={`Insert ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  ref={greetingTextareaRef}
                  rows={8}
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  placeholder="Enter your welcome greeting message..."
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-b-xl p-4 text-white font-sans text-sm focus:border-emerald-500 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 font-sans">
                    Cooldown Window (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    value={autoReplyCooldown}
                    onChange={(e) => setAutoReplyCooldown(parseInt(e.target.value, 10) || 10)}
                    className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-2 text-white font-sans text-sm focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Prevents duplicate greetings if user sends multiple messages within this window.
                  </p>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    <FiSave /> {savingConfig ? "Saving to Database..." : "Save Auto-Reply Settings"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Col (5 cols): Live WhatsApp Phone Greeting Simulator */}
          <div className="lg:col-span-5 bg-[#161923] border border-[#2a2d3e] rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white text-sm mb-1 flex items-center gap-2">
                <FiPhoneCall className="text-emerald-400" /> Live Customer Phone Simulator
              </h4>
              <p className="text-xs text-gray-400 mb-4">
                Preview of how your auto-reply appears on a customer&rsquo;s WhatsApp when they send &ldquo;hello&rdquo;
              </p>

              {/* Simulated Phone Screen */}
              <div
                className="border border-[#2a3942] rounded-2xl p-4 space-y-3 min-h-[300px] flex flex-col justify-end"
                style={{
                  backgroundColor: "#0b141a",
                  backgroundImage: "radial-gradient(circle at 50% 50%, rgba(20, 30, 36, 0.4) 0%, transparent 100%)",
                }}
              >
                {/* Customer incoming message */}
                <div className="flex justify-start">
                  <div className="bg-[#202c33] text-gray-200 px-3.5 py-2.5 rounded-2xl rounded-bl-none text-sm font-sans max-w-[80%] shadow border border-[#2a3942]">
                    <p>hello sportsvilla!</p>
                    <span className="text-[9px] text-gray-400 block text-right mt-1">10:42 AM</span>
                  </div>
                </div>

                {/* Automated bot reply */}
                {autoReplyEnabled ? (
                  <div className="flex justify-end">
                    <div className="bg-[#005c4b] text-white px-3.5 py-2.5 rounded-2xl rounded-br-none text-sm font-sans max-w-[85%] shadow space-y-1">
                      <div className="text-[10px] text-emerald-300 font-bold mb-1">
                        ⚡ Automated Greeting
                      </div>
                      <div className="space-y-0.5 leading-relaxed text-sm">
                        {renderWhatsAppRichText(autoReplyMessage || DEFAULT_INTRO)}
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
                        <span className="text-[9px] text-gray-300">10:42 AM</span>
                        <span className="text-emerald-300 text-xs">✓✓</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-rose-300 text-xs">
                    Greeting Auto-Reply is currently disabled. No automated response will be sent.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#0f1117] border border-[#2a2d3e] rounded-xl text-xs text-gray-400 flex items-center gap-2">
              <FiInfo className="text-emerald-400 text-base shrink-0" />
              <span>
                Settings are stored dynamically in <strong className="text-white font-mono">whatsapp.db</strong> and take effect immediately without server reboot.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
