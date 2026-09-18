"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

import { ConversationList } from "./components/ConversationList";
import { ChatPane } from "./components/ChatPane";
import { MemberContextSidebar } from "./components/MemberContextSidebar";
import { GenerateCouponModal, RegisterUserModal, AssignMembershipModal } from "./components/CrmActionModals";

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
  
  const [replyingTo, setReplyingTo] = useState<{ id?: string; wamid?: string; content: string; sender: string } | null>(null);
  
  const [memberContext, setMemberContext] = useState<any | null>(null);
  const [loadingMemberContext, setLoadingMemberContext] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Modals state
  const [showGenerateCoupon, setShowGenerateCoupon] = useState(false);
  const [showRegisterUser, setShowRegisterUser] = useState(false);
  const [showAssignMembership, setShowAssignMembership] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await fetch(`/api/client/v1/whatsapp/chat?phoneNumber=${encodeURIComponent(phone)}`);
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

  const selectedConv = conversations.find(c => c.phoneNumber === selectedPhone);

  return (
    <div className="flex w-full h-[calc(100vh-64px)] bg-sv-bg border-t border-sv-border border-[#2a2d3e] font-sans overflow-hidden">
      
      <ConversationList
        conversations={conversations}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPhone={selectedPhone}
        setSelectedPhone={setSelectedPhone}
      />

      <ChatPane
        selectedPhone={selectedPhone}
        selectedConv={selectedConv}
        chatMessages={chatMessages}
        fetchConversations={fetchConversations}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendingChat={sendingChat}
        handleSendChatMessage={handleSendChatMessage}
        messagesEndRef={messagesEndRef as any}
        templates={templates}
      />

      <MemberContextSidebar
        selectedPhone={selectedPhone}
        loadingMemberContext={loadingMemberContext}
        memberContext={memberContext}
        setChatInput={setChatInput}
        onOpenGenerateCoupon={() => setShowGenerateCoupon(true)}
        onOpenAssignMembership={() => setShowAssignMembership(true)}
        onOpenRegisterUser={() => setShowRegisterUser(true)}
      />

      {/* CRM Modals */}
      {showGenerateCoupon && selectedPhone && (
        <GenerateCouponModal
          phone={selectedPhone}
          members={memberContext?.members || []}
          onClose={() => setShowGenerateCoupon(false)}
          onCouponGenerated={(code, amount) => {
            setShowGenerateCoupon(false);
            setChatInput(`Here is your special discount code for ₹${amount} off: *${code}*`);
          }}
        />
      )}

      {showRegisterUser && selectedPhone && (
        <RegisterUserModal
          phone={selectedPhone}
          onClose={() => setShowRegisterUser(false)}
          onSuccess={() => {
            setShowRegisterUser(false);
            fetchMemberContext(selectedPhone);
          }}
        />
      )}

      {showAssignMembership && selectedPhone && (
        <AssignMembershipModal
          phone={selectedPhone}
          members={memberContext?.members || []}
          onClose={() => setShowAssignMembership(false)}
          onSuccess={() => {
            setShowAssignMembership(false);
            fetchMemberContext(selectedPhone);
          }}
        />
      )}
    </div>
  );
}
