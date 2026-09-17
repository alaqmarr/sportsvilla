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
              e.target.style.height = e.target.scrollHeight + 'px';
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
  );
}
