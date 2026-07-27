"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiMessageSquare,
  FiSend,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiTerminal,
  FiX,
  FiUser,
  FiUsers,
  FiAward,
  FiCalendar,
  FiTag,
  FiSearch,
  FiCornerUpLeft,
  FiActivity,
  FiSliders,
  FiLayers,
  FiZap,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa";

// ── Professional WhatsApp-Style Tick SVGs ──────────────────────────────────────
const SingleTick = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 11" width="16" height="11" className={className}>
    <path
      d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.46.46 0 0 0-.349-.163.457.457 0 0 0-.334.135.52.52 0 0 0 0 .721l2.362 2.459a.463.463 0 0 0 .338.156h.044a.462.462 0 0 0 .338-.186l6.533-8.052a.502.502 0 0 0-.046-.687z"
      fill="currentColor"
    />
  </svg>
);

const DoubleTick = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 11" width="16" height="11" className={className}>
    <path
      d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.011-2.095a.46.46 0 0 0-.349-.163.457.457 0 0 0-.334.135.52.52 0 0 0 0 .721l2.362 2.459a.463.463 0 0 0 .338.156h.044a.462.462 0 0 0 .338-.186l6.533-8.052a.502.502 0 0 0-.046-.687z"
      fill="currentColor"
    />
    <path
      d="M15.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-1.016-1.058a.457.457 0 0 0-.322.108.502.502 0 0 0-.046.687l1.38 1.436a.463.463 0 0 0 .338.156h.044a.462.462 0 0 0 .338-.186l6.533-8.052a.502.502 0 0 0-.046-.687z"
      fill="currentColor"
      transform="translate(-3, 0)"
    />
  </svg>
);

// WhatsApp-style message status ticks
const MessageTicks = ({ status }: { status: string }) => {
  switch (status?.toUpperCase()) {
    case "READ":
      return <DoubleTick className="text-[#53bdeb]" />;
    case "DELIVERED":
      return <DoubleTick className="text-gray-400" />;
    case "SENT":
      return <SingleTick className="text-gray-400" />;
    case "FAILED":
      return (
        <svg viewBox="0 0 16 15" width="14" height="14" className="text-red-400">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM8.75 10a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 1.5 0v5z" fill="currentColor" />
        </svg>
      );
    case "PENDING":
      return (
        <svg viewBox="0 0 16 15" width="14" height="14" className="text-gray-500">
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm.5 4v4.25l3.5 2.08-.75 1.23L7 9.25V4h1.5z" fill="currentColor" />
        </svg>
      );
    default:
      return <SingleTick className="text-gray-500" />;
  }
};

// Conversation list preview ticks
const PreviewTicks = ({ status }: { status: string }) => {
  switch (status?.toUpperCase()) {
    case "READ":
      return <DoubleTick className="text-[#53bdeb] shrink-0" />;
    case "DELIVERED":
      return <DoubleTick className="text-gray-500 shrink-0" />;
    default:
      return <SingleTick className="text-gray-500 shrink-0" />;
  }
};

export default function WhatsAppClient({ initialConversations, initialMessages = [] }: { initialConversations: any[], initialMessages?: any[] }) {
  const [conversations, setConversations] = useState<any[]>(initialConversations);
  const [messages, setMessages] = useState<any[]>([]);
  const [otps, setOtps] = useState<any[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDebugModal, setShowDebugModal] = useState(false);

  // CRM Chat state
  const [selectedPhone, setSelectedPhone] = useState<string | null>(
    initialConversations.length > 0 ? initialConversations[0].phoneNumber : null
  );
  const [chatMessages, setChatMessages] = useState<any[]>(initialMessages);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Quoting / Reply state
  const [replyingTo, setReplyingTo] = useState<{ id?: string; wamid?: string; content: string; sender: string } | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // CRM Member Context state
  const [memberContext, setMemberContext] = useState<any | null>(null);
  const [loadingMemberContext, setLoadingMemberContext] = useState(false);

  // Auto-scroll ref for WhatsApp chat bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/client/v1/whatsapp/logs");
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setOtps(data.otps || []);
        setWebhookLogs(data.webhookLogs || []);
      }
    } catch (err: any) {
      toast.error("Error loading logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/client/v1/whatsapp/conversations");
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        if (!selectedPhone && data.conversations?.length > 0) {
          setSelectedPhone(data.conversations[0].phoneNumber);
        }
      }
    } catch (err: any) {
      console.error("Error fetching conversations", err);
    }
  };

  const fetchChatMessages = async (phone: string) => {
    try {
      const res = await fetch(`/api/client/v1/whatsapp/chat?phoneNumber=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
        
        // Mark messages as read in the background
        fetch("/api/client/v1/whatsapp/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: phone }),
        }).then(() => fetchConversations());
      }
    } catch (err: any) {
      console.error("Error fetching chat messages", err);
    }
  };

  const fetchMemberContext = async (phone: string) => {
    if (!phone) return;
    try {
      setLoadingMemberContext(true);
      const res = await fetch(`/api/client/v1/whatsapp/member-context?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.status === "ok") {
        setMemberContext(data);
      } else {
        setMemberContext({ found: false, count: 0, members: [] });
      }
    } catch (err: any) {
      console.error("Error loading member context", err);
      setMemberContext({ found: false, count: 0, members: [] });
    } finally {
      setLoadingMemberContext(false);
    }
  };

  // Quick Actions Helper: 0 server overhead client-side formatting
  const triggerQuickShare = (text: string) => {
    setChatInput(text);
    toast.success("⚡ Template loaded into input! Review and click Send.");
  };

  // WhatsApp Rich Text Helper (*bold*, _italics_, ~strikethrough~, URLs)
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

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!initialConversations || initialConversations.length === 0) {
      fetchConversations();
    }
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [initialConversations]);

  useEffect(() => {
    if (selectedPhone) {
      // Only show loading if we don't already have messages for this phone
      if (chatMessages.length === 0 || (chatMessages[0] && chatMessages[0].phoneNumber !== selectedPhone)) {
        setChatLoading(true);
      }
      // Do not clear chatMessages array to prevent blinking/flashing
      setMemberContext(null);
      setReplyingTo(null);

      Promise.all([
        fetchChatMessages(selectedPhone),
        fetchMemberContext(selectedPhone)
      ]).finally(() => {
        setChatLoading(false);
      });

      const interval = setInterval(() => {
        fetchChatMessages(selectedPhone);
        fetchConversations();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedPhone]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone || !chatInput.trim() || sendingChat) return;

    setSendingChat(true);
    const textToSend = chatInput.trim();
    const targetContextId = replyingTo?.wamid || replyingTo?.id;
    setChatInput("");
    setReplyingTo(null);

    try {
      const res = await fetch("/api/client/v1/whatsapp/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: selectedPhone,
          message: textToSend,
          contextMessageId: targetContextId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message sent via WhatsApp!");
        await fetchChatMessages(selectedPhone);
      } else {
        toast.error(`Send failed: ${data.error}`);
        setChatInput(textToSend);
      }
    } catch (err: any) {
      toast.error("Error sending message");
      setChatInput(textToSend);
    } finally {
      setSendingChat(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.phoneNumber.includes(searchQuery.replace(/\D/g, "")) ||
    (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col w-full h-[100dvh] bg-[#0b141a] overflow-hidden text-gray-200">
      {/* Compact Top Bar */}
      <div className="bg-[#111b21] border-b border-[#222d34] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <FaWhatsapp className="text-[#25D366]" size={20} />
          </div>
          <h1 className="text-base font-extrabold text-white tracking-tight">Live CRM Chat</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Meta API
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchLogs();
              setShowDebugModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-gray-200 text-xs font-semibold transition-all"
          >
            <FiTerminal className="text-orange-400" /> Logs
          </button>
          <button
            onClick={() => {
              fetchConversations();
              if (selectedPhone) {
                fetchChatMessages(selectedPhone);
                fetchMemberContext(selectedPhone);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a884] hover:bg-[#008f6f] text-white text-xs font-bold transition-all"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Edge-to-Edge 3-Column WhatsApp CRM Layout */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Column 1: Conversations List */}
        <div
          className={`${
            selectedPhone ? "hidden md:flex" : "flex"
          } col-span-12 md:col-span-3 border-r border-[#222d34] bg-[#111b21] flex-col h-full overflow-hidden`}
        >
          <div className="p-3 border-b border-[#222d34] bg-[#111b21]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, or messages..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#202c33] text-white text-xs rounded-lg border border-[#2a3942] focus:outline-none focus:border-[#00a884] placeholder-gray-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-[#222d34]">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                No matching WhatsApp conversations found.
              </div>
            ) : (
              filteredConversations.map((conv: any, idx: number) => {
                const isSelected = selectedPhone === conv.phoneNumber;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhone(conv.phoneNumber)}
                    className={`w-full text-left p-3.5 hover:bg-[#202c33] transition-all flex flex-col gap-1 ${
                      isSelected ? "bg-[#2a3942] border-l-4 border-[#00a884]" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans font-bold text-white text-xs truncate">
                        {conv.memberName
                          ? `${conv.memberName} (${conv.phoneNumber})`
                          : `+91 ${conv.phoneNumber}`}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[#00a884] shadow-sm text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400">
                          {new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 truncate font-sans flex items-center gap-1.5">
                      {conv.lastDirection === "OUTGOING" && (
                        <PreviewTicks status={conv.lastStatus} />
                      )}
                      <span className="truncate">
                        {conv.lastDirection === "OUTGOING" ? "You: " : ""}{conv.lastMessage}
                      </span>
                    </p>

                    <div className="flex items-center justify-between mt-0.5">
                      {conv.is24HourWindowOpen ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                          🟢 24h Window Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-400">
                          🔴 Expired (Template needed)
                        </span>
                      )}
                      <span className="text-[10px] text-gray-500">{conv.totalMessages} msgs</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Mobile Navigation Links */}
          <div className="md:hidden border-t border-[#222d34] p-2 bg-[#111b21] grid grid-cols-3 gap-1.5">
            <Link href="/whatsapp-admin/health" className="bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-lg py-2 text-center text-[10px] font-bold text-gray-300 transition-all">
              <FiActivity className="inline mb-0.5" size={12} /> Health
            </Link>
            <Link href="/whatsapp-admin/templates" className="bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-lg py-2 text-center text-[10px] font-bold text-gray-300 transition-all">
              <FiLayers className="inline mb-0.5" size={12} /> Templates
            </Link>
            <Link href="/whatsapp-admin/events" className="bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-lg py-2 text-center text-[10px] font-bold text-gray-300 transition-all">
              <FiZap className="inline mb-0.5" size={12} /> Events
            </Link>
          </div>
        </div>

        {/* Column 2: WhatsApp Web Dark Real-Time Chat Area */}
        <div className="col-span-12 md:col-span-6 bg-[#0b141a] flex flex-col h-full overflow-hidden relative">
          {selectedPhone ? (
            <>
              {/* Edge-to-Edge Chat Header */}
              <div className="px-4 py-2.5 border-b border-[#222d34] bg-[#202c33] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button 
                    className="md:hidden text-[#00a884] hover:bg-white/5 p-1 rounded-full mr-1 transition-colors"
                    onClick={() => setSelectedPhone(null)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00a884] to-[#02735e] flex items-center justify-center text-white font-bold font-sans text-xs shrink-0 shadow-lg">
                    {selectedPhone.slice(-2)}
                  </div>
                  <div className="flex flex-col truncate">
                    <h3 className="font-bold text-white text-[15px] font-sans truncate">
                      {conversations.find((c) => c.phoneNumber === selectedPhone)?.memberName 
                        ? `${conversations.find((c) => c.phoneNumber === selectedPhone)?.memberName} (${selectedPhone})` 
                        : `+91 ${selectedPhone}`}
                    </h3>
                    <p className="text-[11px] text-gray-300 truncate">
                      {conversations.find((c) => c.phoneNumber === selectedPhone)?.is24HourWindowOpen
                        ? "🟢 Online • 24h Free Reply Window Open"
                        : "🔴 Window Expired • Send template to start session"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      fetchChatMessages(selectedPhone);
                      fetchMemberContext(selectedPhone);
                    }}
                    title="Refresh Conversation"
                    className="p-1.5 rounded-lg bg-[#2a3942] hover:bg-[#374955] text-gray-300 transition-colors"
                  >
                    <FiRefreshCw size={13} />
                  </button>
                </div>
              </div>

              {/* WhatsApp Messages List with Reply support */}
              <div
                className="flex-1 p-4 overflow-y-auto space-y-2.5"
                style={{
                  backgroundColor: "#0b141a",
                  backgroundImage: "radial-gradient(circle at 50% 50%, rgba(20, 30, 36, 0.4) 0%, transparent 100%)",
                }}
              >
                {chatLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-3">
                    <FiRefreshCw className="animate-spin text-2xl text-emerald-400" />
                    <p className="text-gray-400 text-xs">Loading chat history...</p>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-xs">
                    No WhatsApp messages recorded with this number yet.
                  </div>
                ) : (
                  chatMessages.map((msg: any, idx: number) => {
                    const isOutgoing = msg.direction === "OUTGOING";
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col group ${isOutgoing ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 max-w-lg">
                          {/* Reply Button on Hover */}
                          {!isOutgoing && (
                            <button
                              onClick={() =>
                                setReplyingTo({
                                  id: msg.id,
                                  wamid: msg.wamid,
                                  content: msg.content,
                                  sender: `+91 ${selectedPhone}`,
                                })
                              }
                              title="Reply to message"
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-[#202c33] text-gray-300 hover:text-white transition-opacity shrink-0"
                            >
                              <FiCornerUpLeft size={13} />
                            </button>
                          )}

                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-sm font-sans shadow ${
                              isOutgoing
                                ? "bg-[#005c4b] text-white rounded-br-none"
                                : "bg-[#202c33] text-gray-100 rounded-bl-none border border-[#2a3942]"
                            }`}
                          >
                            <div className="space-y-0.5 leading-relaxed text-sm">
                              {renderWhatsAppRichText(msg.content)}
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-1 -mb-0.5">
                              <span className="text-[10px] text-gray-400/80">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isOutgoing && <MessageTicks status={msg.status} />}
                            </div>
                          </div>

                          {/* Reply Button for outgoing messages */}
                          {isOutgoing && (
                            <button
                              onClick={() =>
                                setReplyingTo({
                                  id: msg.id,
                                  wamid: msg.wamid,
                                  content: msg.content,
                                  sender: "You",
                                })
                              }
                              title="Reply to message"
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-[#202c33] text-gray-300 hover:text-white transition-opacity shrink-0"
                            >
                              <FiCornerUpLeft size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                {/* Anchor for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Quote Banner */}
              {replyingTo && (
                <div className="bg-[#1e2a30] px-4 py-2 border-t border-[#2a3942] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 border-l-2 border-[#00a884] pl-3 overflow-hidden">
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#00a884]">Replying to {replyingTo.sender}</p>
                      <p className="text-xs text-gray-300 truncate font-sans">{replyingTo.content}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1 rounded hover:bg-[#202c33] text-gray-400 hover:text-white shrink-0"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              )}

              {/* WhatsApp Edge-to-Edge Input Bar */}
              <div className="relative border-t border-[#202c33] bg-[#202c33] shrink-0">
                {showQuickReplies && (
                  <div className="absolute bottom-full left-2 mb-2 w-64 bg-[#2a3942] border border-[#3b4a54] rounded-xl shadow-lg overflow-hidden z-10">
                    <div className="p-2 border-b border-[#3b4a54] text-xs font-bold text-gray-400 uppercase tracking-wider">Quick Replies</div>
                    <div className="max-h-48 overflow-y-auto">
                      {["Sure, checking this for you.", "Your slot is confirmed!", "Can you please share the date?", "Apologies, this slot is already booked."].map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setChatInput(reply);
                            setShowQuickReplies(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-[#3b4a54] transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <form
                  onSubmit={handleSendChatMessage}
                  className="p-3 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="text-gray-400 hover:text-white p-2 shrink-0 transition-colors"
                    title="Quick Replies"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={replyingTo ? "Type your reply..." : "Type a WhatsApp message..."}
                    disabled={sendingChat}
                    className="flex-1 bg-[#2a3942] border border-transparent rounded-xl px-4 py-2 text-white font-sans text-sm focus:border-[#00a884] outline-none transition-all placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={sendingChat || !chatInput.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a884] hover:bg-[#008f6f] disabled:opacity-50 text-white font-bold text-xs shadow transition-all shrink-0"
                  >
                    <FiSend /> {sendingChat ? "..." : "Send"}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-3 p-8">
              <FiMessageSquare className="text-5xl opacity-20 text-emerald-500" />
              <h4 className="text-sm font-bold text-gray-400">WhatsApp CRM Live Workspace</h4>
              <p className="text-xs text-center max-w-sm text-gray-500">
                Select a customer conversation from the left to start chatting in real time and view their live CRM & family details!
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Member CRM Profile & Family Context Sidebar (Edge-to-Edge) */}
        <div className="hidden md:flex col-span-3 border-l border-[#222d34] bg-[#111b21] flex-col h-full overflow-y-auto">
          <div className="p-3 border-b border-[#222d34] bg-[#111b21] flex items-center justify-between shrink-0">
            <h3 className="font-bold text-white text-xs flex items-center gap-2">
              <FiUser className="text-emerald-400" /> Member & Family Context
            </h3>
            {selectedPhone && (
              <button
                onClick={() => fetchMemberContext(selectedPhone)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
                title="Reload Member Context"
              >
                <FiRefreshCw className={loadingMemberContext ? "animate-spin" : ""} size={13} />
              </button>
            )}
          </div>

          <div className="p-3 space-y-3 flex-1">
            {!selectedPhone ? (
              <div className="text-center py-16 text-gray-500 text-xs space-y-2">
                <FiUser className="text-3xl mx-auto opacity-30" />
                <p>Customer details, family members, memberships, and bookings will appear here.</p>
              </div>
            ) : loadingMemberContext ? (
              <div className="text-center py-16 text-gray-400 text-xs space-y-3">
                <FiRefreshCw className="animate-spin text-2xl mx-auto text-emerald-400" />
                <p>Looking up CRM records for +91 {selectedPhone}...</p>
              </div>
            ) : memberContext?.found ? (
              <div className="space-y-3">
                {/* Family Accounts Badge */}
                <div className="bg-[#202c33] border border-[#2a3942] rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-emerald-400 text-sm" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {memberContext.count > 1 ? `Family Account (${memberContext.count})` : "Member Account"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-sans">+91 {selectedPhone}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      CRM Linked
                    </span>
                  </div>

                  {/* Quick Family Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-[#2a3942]">
                    <button
                      type="button"
                      onClick={() => {
                        const text =
                          `👨‍👩‍👧 *SportsVilla Family Account Summary*\n📱 *Linked Mobile*: +91 ${selectedPhone}\n*Total Accounts*: ${memberContext.count}\n\n` +
                          memberContext.members
                            .map((m: any, idx: number) => {
                              const plan = m.memberships?.find((mp: any) => mp.status === "ACTIVE");
                              return `${idx + 1}. *${m.name}* - Wallet: ₹${((m.walletBalance || 0) / 100).toFixed(0)} | Loyalty: 🏆 ${m.loyaltyPoints || 0} pts${
                                plan ? ` | Plan: ${plan.membershipPlan?.name || "Active"}` : ""
                              }`;
                            })
                            .join("\n") +
                          `\n\nReply to this message if you need to book a turf or manage your memberships! ⚽🏏`;
                        triggerQuickShare(text);
                      }}
                      className="flex-1 bg-[#18232c] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-[#2a3942] text-[10px] font-medium text-gray-300 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all"
                      title="Share full summary of all linked family accounts"
                    >
                      👨‍👩‍👧 Share Family
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `➕ *Add a Family Member to SportsVilla*\nHello! You can register a family member or friend under your phone number anytime using our official portal:\n\n🌐 *Register Online*: https://sportsvilla.co.in/register?mobile=${selectedPhone}\n\nWe look forward to seeing you all on the field! 🏆`;
                        triggerQuickShare(text);
                      }}
                      className="flex-1 bg-[#18232c] hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 border border-[#2a3942] text-[10px] font-medium text-gray-300 py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition-all"
                      title="Send sign-up/registration link to add another family member"
                    >
                      ➕ Add Member Link
                    </button>
                  </div>
                </div>

                {/* Member Cards */}
                <div className="space-y-3">
                  {memberContext.members.map((member: any, mIdx: number) => {
                    const activePlan = member.memberships?.find((m: any) => m.status === "ACTIVE");
                    return (
                      <div
                        key={mIdx}
                        className="bg-[#18232c] border border-[#222d34] rounded-xl p-3 space-y-2.5 shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white">{member.name}</h4>
                            <p className="text-[11px] text-gray-400 font-sans">+91 {member.mobile}</p>
                          </div>
                          <span className="text-[10px] text-gray-500">
                            Joined {new Date(member.joinDate || member.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        {/* Wallet & Loyalty stats */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <div className="bg-[#111b21] rounded-lg p-1.5 text-center">
                            <span className="text-[9px] text-gray-400 block">Wallet</span>
                            <span className="text-xs font-bold text-emerald-400 font-sans">
                              ₹{((member.walletBalance || 0) / 100).toFixed(0)}
                            </span>
                          </div>
                          <div className="bg-[#111b21] rounded-lg p-1.5 text-center">
                            <span className="text-[9px] text-gray-400 block">Loyalty</span>
                            <span className="text-xs font-bold text-amber-400 font-sans">
                              🏆 {member.loyaltyPoints || 0} pts
                            </span>
                          </div>
                        </div>

                        {/* Active Membership Plan */}
                        <div className="pt-2 border-t border-[#222d34]">
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FiAward className="text-orange-400" /> Membership Status
                          </h5>
                          {activePlan ? (
                            <div className="bg-[#111b21] border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {activePlan.membershipPlan?.name || "Member Plan"}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  Valid until {new Date(activePlan.endDate).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                                ACTIVE
                              </span>
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-500 italic">No active membership</p>
                          )}
                        </div>

                        {/* Recent Bookings */}
                        <div className="pt-2 border-t border-[#222d34]">
                          <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <FiCalendar className="text-blue-400" /> Recent Bookings
                          </h5>
                          {member.bookings && member.bookings.length > 0 ? (
                            <div className="space-y-1">
                              {member.bookings.map((b: any, bIdx: number) => (
                                <div
                                  key={bIdx}
                                  className="bg-[#111b21] rounded-lg p-1.5 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="text-white font-medium block text-xs">
                                      {b.turf?.name || b.sport?.name || "Turf Booking"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {new Date(b.createdAt).toLocaleDateString("en-IN")}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      b.status === "CONFIRMED"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-gray-500/10 text-gray-400"
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-500 italic">No recent turf bookings</p>
                          )}
                        </div>

                        {/* Quick WhatsApp Share Actions */}
                        <div className="pt-2 border-t border-[#222d34]">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                              <FiSend className="text-emerald-400" /> Quick WhatsApp Share
                            </span>
                            <span className="text-[8px] text-gray-500 font-sans">(0 server load)</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                const text = `🏏 *SportsVilla Member Details*\n👤 *Name*: ${member.name}\n📱 *Phone*: +91 ${member.mobile}\n💰 *Wallet Balance*: ₹${((member.walletBalance || 0) / 100).toFixed(0)}\n🏆 *Loyalty Points*: ${member.loyaltyPoints || 0} pts\n🏷️ *Membership*: ${
                                  activePlan
                                    ? `${activePlan.membershipPlan?.name || "Active Plan"} (Valid till ${new Date(activePlan.endDate).toLocaleDateString("en-IN")})`
                                    : "Standard Member"
                                }\n\nThank you for being part of SportsVilla! Let us know if you need any assistance.`;
                                triggerQuickShare(text);
                              }}
                              className="bg-[#111b21] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 border border-[#222d34] text-[10px] text-gray-300 font-medium py-1 px-1 rounded-md flex items-center justify-center gap-1 transition-all"
                              title="Load full member account summary into chat box"
                            >
                              👤 Profile
                            </button>

                            <button
                              type="button"
                              disabled={!member.bookings || member.bookings.length === 0}
                              onClick={() => {
                                const b = member.bookings?.[0];
                                if (!b) return;
                                const text = `🎟️ *Your Recent SportsVilla Booking*\n🏟️ *Turf / Sport*: ${b.turf?.name || b.sport?.name || "Turf Booking"}\n📅 *Date*: ${new Date(b.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}\n🟢 *Status*: ${b.status}\n\nWe look forward to hosting you! Reply here for any rescheduling or queries. ⚽🏏`;
                                triggerQuickShare(text);
                              }}
                              className="bg-[#111b21] hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/40 border border-[#222d34] text-[10px] text-gray-300 font-medium py-1 px-1 rounded-md flex items-center justify-center gap-1 transition-all disabled:opacity-30 disabled:hover:bg-[#111b21] disabled:hover:text-gray-500 disabled:cursor-not-allowed"
                              title="Load latest turf booking into chat box"
                            >
                              🎟️ Booking
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const text = `💳 *SportsVilla Wallet & Rewards Update*\nHello *${member.name}*! Here is your latest balance update:\n\n💰 *Wallet Balance*: ₹${((member.walletBalance || 0) / 100).toFixed(0)}\n🏆 *Loyalty Points*: ${member.loyaltyPoints || 0} pts\n\nYou can use your wallet balance and rewards towards your next turf booking or tournament entry! 🏏⚽`;
                                triggerQuickShare(text);
                              }}
                              className="bg-[#111b21] hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/40 border border-[#222d34] text-[10px] text-gray-300 font-medium py-1 px-1 rounded-md flex items-center justify-center gap-1 transition-all"
                              title="Load wallet balance & rewards points into chat box"
                            >
                              💳 Wallet
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-[#18232c] border border-[#222d34] rounded-xl p-5 space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto text-lg">
                    <FiTag />
                  </div>
                  <h4 className="text-xs font-bold text-white">Unregistered Lead / Contact</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    +91 {selectedPhone} is not linked to any member account.
                  </p>
                </div>
                
                <div className="pt-3 border-t border-[#222d34] space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mb-2">Quick Actions</p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const text = `👋 *Welcome to SportsVilla!*\nWe noticed you aren't registered with us yet. Register online in 30 seconds using your number (+91 ${selectedPhone}) to unlock wallet rewards, turf bookings, and member discounts:\n\n🌐 *Register Here*: https://sportsvilla.co.in/register?mobile=${selectedPhone}\n\nSee you on the field! ⚽🏏`;
                      triggerQuickShare(text);
                    }}
                    className="w-full bg-[#111b21] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/40 border border-[#222d34] text-xs text-gray-300 font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    📝 Send Registration Link
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = `🎁 *Exclusive Welcome Discount from SportsVilla!*\nUse promo code *SPORTSVILLA100* on your first turf booking or membership purchase to get ₹100 OFF!\n\n🌐 *Claim Now*: https://sportsvilla.co.in/register?mobile=${selectedPhone}&coupon=SPORTSVILLA100`;
                      triggerQuickShare(text);
                    }}
                    className="w-full bg-[#111b21] hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/40 border border-[#222d34] text-xs text-gray-300 font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    🏷️ Send Welcome Coupon
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = `⚽🏏 *Book Your Turf at SportsVilla*\nExplore our turfs, check live slot availability, and book instantly:\n\n📅 *Booking Portal*: https://sportsvilla.co.in/turfs\n\nReply to this message if you need help choosing a slot!`;
                      triggerQuickShare(text);
                    }}
                    className="w-full bg-[#111b21] hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/40 border border-[#222d34] text-xs text-gray-300 font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    🏟️ Send Turf Booking Link
                  </button>

                  <a
                    href={`/members?addMobile=${selectedPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#202c33] hover:bg-[#2a3942] border border-[#222d34] text-xs text-white font-medium py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-center mt-4"
                  >
                    ⚡ Create Profile in CRM
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Webhook Debug Modal / Drawer */}
      {showDebugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#2a2d3e] flex items-center justify-between bg-[#0f1117]">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FiTerminal className="text-orange-400" /> Meta Webhook Debug Logs & Raw Payload Inspector
                </h3>
                <p className="text-xs text-gray-400">
                  Inspect raw HTTP hits from Meta and the live WhatsApp message database table
                </p>
              </div>
              <button
                onClick={() => setShowDebugModal(false)}
                className="p-2 rounded-lg bg-[#202433] hover:bg-[#2a2d3e] text-gray-300"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Raw Webhook Hits */}
              <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#2a2d3e] flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Raw Webhook Hits from Meta ({webhookLogs.length})</h4>
                  <span className="text-xs text-gray-400 font-mono">/api/client/v1/whatsapp/webhook</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a2d3e] bg-[#161923] text-xs font-semibold text-gray-400 uppercase">
                        <th className="p-3">Time</th>
                        <th className="p-3">Event</th>
                        <th className="p-3">Raw Payload</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2d3e]/60 text-xs font-mono">
                      {webhookLogs.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-gray-500">
                            No raw webhook hits received yet.
                          </td>
                        </tr>
                      ) : (
                        webhookLogs.map((log: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#202433]/40">
                            <td className="p-3 text-gray-400 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                            </td>
                            <td className="p-3 text-orange-400 font-bold">{log.event}</td>
                            <td className="p-3 text-gray-300 max-w-xl truncate" title={log.payload}>
                              {log.payload}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Message Logs Table */}
              <div className="bg-[#0f1117] border border-[#2a2d3e] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#2a2d3e] flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Recent Message Database Records ({messages.length})</h4>
                  <span className="text-xs text-gray-400 font-mono">WhatsAppMessage table</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2a2d3e] bg-[#161923] text-xs font-semibold text-gray-400 uppercase">
                        <th className="p-3">Time</th>
                        <th className="p-3">Direction</th>
                        <th className="p-3">Phone Number</th>
                        <th className="p-3">Content</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2a2d3e]/60 text-xs">
                      {messages.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-500">
                            No messages in database yet.
                          </td>
                        </tr>
                      ) : (
                        messages.map((msg: any, idx: number) => (
                          <tr key={idx} className="hover:bg-[#202433]/40">
                            <td className="p-3 text-gray-400 font-mono whitespace-nowrap">
                              {new Date(msg.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                  msg.direction === "OUTGOING"
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-purple-500/10 text-purple-400"
                                }`}
                              >
                                {msg.direction}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-white">{msg.phoneNumber}</td>
                            <td className="p-3 font-mono text-gray-300 max-w-md truncate" title={msg.content}>
                              {msg.content}
                            </td>
                            <td className="p-3">{getStatusBadge(msg.status)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#2a2d3e] bg-[#0f1117] flex justify-end">
              <button
                onClick={() => setShowDebugModal(false)}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
