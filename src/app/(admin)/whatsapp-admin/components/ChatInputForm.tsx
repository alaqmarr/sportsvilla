import React, { useRef, useState } from "react";
import Link from "next/link";
import { FiMessageSquare, FiSend } from "react-icons/fi";
import { Button } from "@/components/admin/ui";

export function ChatInputForm({
  selectedConv,
  chatInput,
  setChatInput,
  sendingChat,
  handleSendChatMessage,
  replyingTo,
}: {
  selectedConv: any;
  chatInput: string;
  setChatInput: (text: string) => void;
  sendingChat: boolean;
  handleSendChatMessage: (e: React.FormEvent) => void;
  replyingTo: any;
}) {
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="bg-sv-surface border-t border-sv-border p-3 shrink-0 relative">
      {showQuickReplies && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-sv-surface border border-sv-border rounded-sv-md shadow-sv-lg overflow-hidden z-20">
          <div className="p-2 border-b border-sv-border text-xs font-bold text-sv-text-muted uppercase tracking-wider bg-sv-surface-raised">
            Quick Replies
          </div>
          <div className="max-h-48 overflow-y-auto">
            {["Sure, checking this for you.", "Your slot is confirmed!", "Can you please share the date?", "Apologies, this slot is already booked."].map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setChatInput(reply);
                  setShowQuickReplies(false);
                  chatInputRef.current?.focus();
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
        <form onSubmit={handleSendChatMessage} className="flex items-end gap-2 bg-[#f0f2f5] dark:bg-[#202c33] rounded-2xl px-2 py-1.5 shadow-sm border border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className="p-2.5 rounded-full text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
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
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (chatInput.trim() && !sendingChat) handleSendChatMessage(e as any);
              }
            }}
            placeholder={replyingTo ? "Type your reply..." : "Type a message"}
            rows={1}
            className="flex-1 bg-white dark:bg-[#2a3942] border-0 rounded-xl px-4 py-2.5 my-1 text-sv-text text-sm focus:outline-none focus:ring-0 transition-all resize-none min-h-[40px] max-h-32 styled-scrollbar shadow-sm"
          />
          <button
            type="submit"
            disabled={sendingChat || !chatInput.trim()}
            className={`p-2.5 rounded-full shrink-0 transition-colors ${
              chatInput.trim() 
                ? "text-white bg-[#00a884] hover:bg-[#008f6f]" 
                : "text-[#54656f] dark:text-[#aebac1] bg-transparent"
            }`}
          >
            <FiSend size={18} className={sendingChat ? "animate-pulse" : "ml-0.5"} />
          </button>
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
  );
}
