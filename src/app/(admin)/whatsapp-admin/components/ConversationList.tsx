import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { Badge } from "@/components/admin/ui";

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
                className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 border-b border-b-sv-border border-l-4 ${
                  isSelected 
                    ? "bg-sv-surface-hover border-l-sv-brand" 
                    : "border-l-transparent hover:bg-sv-surface-hover"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sv-text text-sm truncate">
                    {conv.memberName || `+91 ${conv.phoneNumber}`}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {conv.unreadCount > 0 && (
                      <Badge variant="success" size="sm" dot>
                        {conv.unreadCount} New
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 opacity-80 mt-1">
                  <p className="text-[13px] text-sv-text-muted truncate flex-1">
                    {conv.lastMessage || "Media/Template message"}
                  </p>
                  <span className="text-[11px] text-sv-text-muted shrink-0 font-medium">
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
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
