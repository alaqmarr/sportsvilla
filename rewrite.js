const fs = require('fs');

const code = 
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiSend,
  FiUser,
  FiSearch,
  FiClock,
  FiX,
  FiCornerUpLeft,
  FiMessageSquare,
  FiInfo,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  Card,
  Button,
  Badge,
  Input,
  Avatar,
  EmptyState
} from "@/components/admin/ui";

const SingleTick = ({ className = "" }) => (
  <svg viewBox="0 0 16 15" width="14" height="14" className={className}>
    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" />
  </svg>
);

const DoubleTick = ({ className = "" }) => (
  <svg viewBox="0 0 16 15" width="14" height="14" className={className}>
    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" />
  </svg>
);

const MessageStatus = ({ status, errorMessage }: { status: string; errorMessage?: string | null }) => {
  switch (status?.toUpperCase()) {
    case "READ":
      return <DoubleTick className="text-sv-brand shrink-0" />;
    case "DELIVERED":
      return <DoubleTick className="text-sv-text-muted shrink-0" />;
    case "SENT":
      return <SingleTick className="text-sv-text-muted shrink-0" />;
    case "FAILED":
      return (
        <div className="relative group flex items-center justify-center cursor-help shrink-0">
          <svg viewBox="0 0 16 15" width="14" height="14" className="text-sv-status-error">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM8.75 10a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 1.5 0v5z" fill="currentColor" />
          </svg>
        </div>
      );
    case "PENDING":
      return (
        <svg viewBox="0 0 16 15" width="14" height="14" className="text-sv-text-muted shrink-0">
          <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm.5 4v4.25l3.5 2.08-.75 1.23L7 9.25V4h1.5z" fill="currentColor" />
        </svg>
      );
    default:
      return <SingleTick className="text-sv-text-muted shrink-0" />;
  }
};

export default function WhatsAppClient({ initialConversations, initialMessages = [] }: { initialConversations: any[], initialMessages?: any[] }) {
  const [conversations, setConversations] = useState<any[]>(initialConversations);
  
  // CRM Chat state
  const [selectedPhone, setSelectedPhone] = useState<string | null>(
    initialConversations.length > 0 ? initialConversations[0].phoneNumber : null
  );
  const [chatMessages, setChatMessages] = useState<any[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState<{ id?: string; wamid?: string; content: string; sender: string } | null>(null);
  
  const [memberContext, setMemberContext] = useState<any | null>(null);
  const [loadingMemberContext, setLoadingMemberContext] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/client/v1/whatsapp/conversations");
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (err: any) {
      console.error("Error fetching conversations", err);
    }
  };

  const fetchChatMessages = async (phone: string) => {
    try {
      const res = await fetch(\/api/client/v1/whatsapp/chat?phoneNumber=\\);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
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
      const res = await fetch(\/api/client/v1/whatsapp/member-context?phone=\\);
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

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/client/v1/whatsapp/analytics");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedPhone) {
      fetchChatMessages(selectedPhone);
      fetchMemberContext(selectedPhone);
    } else {
      setChatMessages([]);
      setMemberContext(null);
    }
  }, [selectedPhone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, replyingTo]);

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
        await fetchChatMessages(selectedPhone);
      } else {
        toast.error(\Send failed: \\);
        setChatInput(textToSend);
      }
    } catch (err: any) {
      toast.error("Error sending message");
      setChatInput(textToSend);
    } finally {
      setSendingChat(false);
      chatInputRef.current?.focus();
    }
  };

  const renderWhatsAppRichText = (text: string) => {
    if (!text) return null;
    try {
      if (text.startsWith('{') && text.includes('"name":')) {
        const rawObj = JSON.parse(text);
        const templateReq = rawObj.template || rawObj;
        return (
          <div className="flex flex-col gap-1 border-l-2 border-sv-brand pl-2 opacity-90">
            <span className="text-[10px] font-bold text-sv-brand uppercase tracking-wider">Template Sent</span>
            <span className="font-mono text-xs bg-black/10 p-2 rounded truncate max-w-[200px]">{templateReq.name}</span>
          </div>
        );
      }
    } catch(e) {}

    return text.split("\n").map((line, lIdx) => {
      let html = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*(.*?)\*/g, '<strong class="font-bold"></strong>')
        .replace(/_(.*?)_/g, '<em class="italic"></em>')
        .replace(/~(.*?)~/g, '<del class="line-through opacity-70"></del>')
        .replace(/(https?:\\/\\/[^\\s]+)/g, '<a href="" target="_blank" class="text-sv-brand underline"></a>');
      return (
        <div key={lIdx} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} className="min-h-[1em]" />
      );
    });
  };

  const filteredConversations = conversations.filter(
    (c) =>
      (c.memberName && c.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phoneNumber.includes(searchQuery.replace(/\\D/g, "")) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedConv = conversations.find(c => c.phoneNumber === selectedPhone);

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-sv-bg border-t border-sv-border font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: CONVERSATIONS */}
      <aside className="w-80 border-r border-sv-border bg-sv-surface flex flex-col shrink-0 h-full">
        <div className="p-4 border-b border-sv-border bg-sv-surface-raised flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-sv-text flex items-center gap-2">
              <FaWhatsapp className="text-sv-brand text-xl" /> CRM Chat
            </h2>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sv-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-sv-bg border border-sv-border rounded-sv-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-sv-brand transition-colors text-sv-text placeholder:text-sv-text-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto styled-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-sv-text-muted text-sm">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedPhone === conv.phoneNumber;
              return (
                <button
                  key={conv.phoneNumber}
                  onClick={() => setSelectedPhone(conv.phoneNumber)}
                  className={\w-full text-left p-4 transition-all flex flex-col gap-1.5 border-b border-b-sv-border border-l-4 \\}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sv-text text-sm truncate">
                      {conv.memberName || \+91 \\}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conv.unreadCount > 0 && (
                        <Badge variant="success" size="sm" dot>
                          {conv.unreadCount} New
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 opacity-80">
                    <p className="text-xs text-sv-text-muted truncate flex-1">
                      {conv.lastMessage || "Media/Template message"}
                    </p>
                    <span className="text-[10px] text-sv-text-muted shrink-0">
                      {new Date(conv.lastMessageTime).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* MIDDLE PANE: CHAT */}
      <section className="flex-1 flex flex-col h-full bg-[#E5DDD5] dark:bg-[#0b141a] relative">
        {selectedPhone ? (
          <>
            {/* Chat Header */}
            <header className="bg-sv-surface border-b border-sv-border p-3 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Avatar fallback={selectedConv?.memberName?.charAt(0) || "U"} size="md" />
                <div>
                  <h3 className="text-sm font-bold text-sv-text">
                    {selectedConv?.memberName || \+91 \\}
                  </h3>
                  <p className="text-xs text-sv-text-muted flex items-center gap-1">
                    +91 {selectedPhone} 
                    {selectedConv?.is24HourWindowOpen ? (
                      <span className="text-sv-status-success font-semibold"> • 24h Window Open</span>
                    ) : (
                      <span className="text-sv-status-error font-semibold"> • 24h Window Closed</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={fetchConversations}>
                  Refresh
                </Button>
              </div>
            </header>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 styled-scrollbar flex flex-col">
              {chatMessages.length === 0 ? (
                <div className="m-auto">
                  <EmptyState title="No messages yet" description="Start the conversation by sending a template." />
                </div>
              ) : (
                chatMessages.map((msg: any, idx: number) => {
                  const isOutgoing = msg.direction === "OUTGOING";
                  return (
                    <div
                      key={idx}
                      className={\lex flex-col group \\}
                    >
                      <div className="flex items-end gap-1.5 max-w-xl">
                        {!isOutgoing && (
                          <button
                            onClick={() => setReplyingTo({ id: msg.id, wamid: msg.wamid, content: msg.content, sender: \+91 \\ })}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-sv-surface hover:bg-sv-surface-hover text-sv-text-muted hover:text-sv-text transition-opacity shrink-0 mb-1"
                          >
                            <FiCornerUpLeft size={13} />
                          </button>
                        )}
                        <div
                          className={\px-3 py-2 rounded-2xl shadow-sm relative \\}
                        >
                          {/* Context / Replied Message */}
                          {msg.contextMessageId && (
                            <div className={\	ext-[10px] mb-1 p-1.5 rounded border-l-2 \ opacity-80 line-clamp-2\}>
                              Replying to previous message...
                            </div>
                          )}

                          <div className="text-sm font-sans space-y-1">
                            {renderWhatsAppRichText(msg.content)}
                          </div>
                          
                          <div className={\lex items-center justify-end gap-1 mt-1 \\}>
                            <span className="text-[9px] font-medium tracking-tight">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOutgoing && <MessageStatus status={msg.status} errorMessage={msg.errorMessage} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Replying To Banner */}
            {replyingTo && (
              <div className="bg-sv-surface px-4 py-2 flex items-center justify-between shrink-0 border-t border-sv-border">
                <div className="flex items-center gap-2 border-l-4 border-sv-brand pl-3">
                  <div>
                    <p className="text-xs font-bold text-sv-brand">Replying to {replyingTo.sender}</p>
                    <p className="text-xs text-sv-text-muted truncate max-w-md">{replyingTo.content}</p>
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="p-1.5 rounded hover:bg-sv-surface-hover text-sv-text-muted">
                  <FiX size={16} />
                </button>
              </div>
            )}

            {/* Chat Input */}
            <div className="bg-sv-surface border-t border-sv-border p-3 shrink-0 relative">
               {showQuickReplies && (
                <div className="absolute bottom-full left-4 mb-2 w-64 bg-sv-surface border border-sv-border rounded-sv-md shadow-sv-lg overflow-hidden z-20">
                  <div className="p-2 border-b border-sv-border text-xs font-bold text-sv-text-muted uppercase tracking-wider bg-sv-surface-raised">Quick Replies</div>
                  <div className="max-h-48 overflow-y-auto">
                    {["Sure, checking this for you.", "Your slot is confirmed!", "Can you please share the date?", "Apologies, this slot is already booked."].map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setChatInput(reply);
                          setShowQuickReplies(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-sv-text hover:bg-sv-surface-hover transition-colors border-b border-sv-border last:border-0"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {selectedConv?.is24HourWindowOpen ? (
                <form onSubmit={handleSendChatMessage} className="flex items-end gap-2">
                   <button
                    type="button"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="p-2.5 rounded-full text-sv-text-muted hover:bg-sv-surface-hover hover:text-sv-brand transition-colors shrink-0 mb-0.5"
                    title="Quick Replies"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                  </button>
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => {
                      setChatInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = (e.target.scrollHeight) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (chatInput.trim() && !sendingChat) handleSendChatMessage(e as any);
                      }
                    }}
                    placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                    rows={1}
                    className="flex-1 bg-sv-bg border border-sv-border rounded-xl px-4 py-3 text-sv-text text-sm focus:outline-none focus:border-sv-brand focus:ring-1 focus:ring-sv-brand transition-all resize-none min-h-[46px] max-h-32 styled-scrollbar"
                  />
                  <Button
                    type="submit"
                    disabled={sendingChat || !chatInput.trim()}
                    className="shrink-0 mb-0.5 !rounded-full !p-3"
                    variant="primary"
                  >
                    <FiSend size={18} className={sendingChat ? "animate-pulse" : ""} />
                  </Button>
                </form>
              ) : (
                <div className="text-center p-3">
                  <p className="text-sm font-medium text-sv-status-error mb-1">24h Window is Closed</p>
                  <p className="text-xs text-sv-text-muted">
                    Use the <Link href="/whatsapp-admin/templates" className="text-sv-brand hover:underline">Templates tab</Link> to start a new conversation.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <EmptyState 
              icon={<FaWhatsapp className="w-12 h-12 text-sv-brand/30" />}
              title="WhatsApp CRM" 
              description="Select a conversation from the left to start messaging."
            />
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR: MEMBER CONTEXT */}
      <aside className="w-80 border-l border-sv-border bg-sv-surface flex flex-col shrink-0 h-full overflow-y-auto styled-scrollbar">
        <div className="p-4 border-b border-sv-border sticky top-0 bg-sv-surface z-10">
          <h2 className="text-sm font-extrabold text-sv-text flex items-center gap-2">
            <FiUser className="text-sv-text-muted" /> Customer CRM
          </h2>
        </div>
        
        <div className="p-4 space-y-6">
          {!selectedPhone ? (
            <p className="text-xs text-sv-text-muted text-center py-8">Select a conversation</p>
          ) : loadingMemberContext ? (
            <div className="space-y-4 animate-pulse">
               <div className="h-24 bg-sv-bg rounded-sv-md"></div>
               <div className="h-24 bg-sv-bg rounded-sv-md"></div>
            </div>
          ) : memberContext?.found ? (
            memberContext.members.map((member: any, i: number) => (
              <Card key={i} variant="default" className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sv-text text-sm">{member.name}</h3>
                    <p className="text-xs text-sv-text-muted mt-0.5">+91 {member.mobile}</p>
                  </div>
                  <Badge variant="neutral" size="sm">
                    {new Date(member.joinDate || member.createdAt).getFullYear()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-sv-bg rounded-sv-sm p-2 text-center border border-sv-border">
                    <p className="text-[10px] text-sv-text-muted font-semibold uppercase tracking-wider mb-0.5">Wallet</p>
                    <p className="text-sm font-bold text-sv-status-success">
                      ₹{((member.walletBalance || 0) / 100).toFixed(0)}
                    </p>
                  </div>
                  <div className="bg-sv-bg rounded-sv-sm p-2 text-center border border-sv-border">
                    <p className="text-[10px] text-sv-text-muted font-semibold uppercase tracking-wider mb-0.5">Loyalty</p>
                    <p className="text-sm font-bold text-sv-brand">
                      {member.loyaltyPoints || 0} pts
                    </p>
                  </div>
                </div>

                {member.activeBookings?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-sv-text-muted mb-2">Upcoming Bookings</p>
                    <div className="space-y-2">
                      {member.activeBookings.slice(0, 3).map((b: any, bIdx: number) => (
                        <div key={bIdx} className="text-[11px] bg-sv-bg border border-sv-border p-2 rounded-sv-sm">
                          <span className="font-medium text-sv-text block">{b.turf?.name || "Turf Booking"}</span>
                          <span className="text-sv-text-muted">{new Date(b.startTime).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center p-6 bg-sv-bg border border-sv-border border-dashed rounded-sv-md">
              <FiAlertCircle className="w-8 h-8 text-sv-text-muted mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-sv-text">Unregistered User</p>
              <p className="text-xs text-sv-text-muted mt-1">This number is not registered in the app database.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
;

fs.writeFileSync('src/app/(admin)/whatsapp-admin/WhatsAppClient.tsx', code);
