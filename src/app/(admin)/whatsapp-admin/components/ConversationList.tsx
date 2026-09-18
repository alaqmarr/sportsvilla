import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Badge, Avatar } from "@/components/admin/ui";

export function ConversationList({
  conversations,
  searchQuery,
  setSearchQuery,
  selectedPhone,
  setSelectedPhone,
}: {
  conversations: any[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedPhone: string | null;
  setSelectedPhone: (phone: string) => void;
}) {
  const filteredConversations = conversations.filter(
    (c) =>
      (c.memberName && c.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phoneNumber.includes(searchQuery.replace(/\D/g, "")) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <aside className="w-80 border-r border-sv-border border-[#2a2d3e] bg-sv-surface flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-sv-border border-[#2a2d3e] bg-sv-surface-raised flex flex-col gap-3 shrink-0">
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
            className="w-full bg-sv-bg border border-[#2a2d3e] border-sv-border border-[#2a2d3e] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-sv-brand focus:ring-1 focus:ring-sv-brand transition-all text-sv-text placeholder:text-sv-text-muted shadow-sm"
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
          filteredConversations.map((conv, idx) => {
            const isSelected = selectedPhone === conv.phoneNumber;
            return (
              <button
                key={conv.phoneNumber}
                onClick={() => setSelectedPhone(conv.phoneNumber)}
                className={`w-full text-left p-3 transition-all flex items-center gap-3 border-b border-b-sv-border border-[#2a2d3e] border-l-4 animate-in fade-in slide-in-from-right-4 duration-300 ${
                  isSelected 
                    ? "bg-sv-surface-hover border-l-sv-brand" 
                    : "border-l-transparent hover:bg-sv-surface-hover"
                }`}
                style={{ animationDelay: `${Math.min(idx * 50, 500)}ms`, animationFillMode: 'both' }}
              >
                <Avatar name={conv.memberName || "User"} size="md" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`font-bold text-sm truncate ${isSelected ? 'text-sv-brand' : 'text-sv-text'}`}>
                      {conv.memberName || `+91 ${conv.phoneNumber}`}
                    </span>
                    <span className={`text-[11px] shrink-0 font-medium ${conv.unreadCount > 0 ? 'text-sv-status-success' : 'text-sv-text-muted'}`}>
                      {(() => {
                        const msgDate = new Date(conv.lastMessageTime);
                        const today = new Date();
                        const isToday = msgDate.getDate() === today.getDate() && msgDate.getMonth() === today.getMonth();
                        if (isToday) {
                          return msgDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                        }
                        return msgDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[13px] truncate flex-1 ${conv.unreadCount > 0 ? 'font-semibold text-sv-text' : 'text-sv-text-muted'}`}>
                      {conv.lastMessage || "Media/Template message"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-sv-status-success text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 min-w-[20px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
