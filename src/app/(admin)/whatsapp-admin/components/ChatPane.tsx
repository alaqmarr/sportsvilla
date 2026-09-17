import React from "react";
import { FiX, FiCornerUpLeft } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { Avatar, Button, EmptyState } from "@/components/admin/ui";
import { ChatInputForm } from "./ChatInputForm";

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

const MessageStatus = ({ status }: { status: string; errorMessage?: string | null }) => {
  switch (status?.toUpperCase()) {
    case "READ":
      return <DoubleTick className="text-[#53bdeb] shrink-0" />;
    case "DELIVERED":
      return <DoubleTick className="text-[#667781] dark:text-white/60 shrink-0" />;
    case "SENT":
      return <SingleTick className="text-[#667781] dark:text-white/60 shrink-0" />;
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

export function ChatPane({
  selectedPhone,
  selectedConv,
  chatMessages,
  fetchConversations,
  replyingTo,
  setReplyingTo,
  chatInput,
  setChatInput,
  sendingChat,
  handleSendChatMessage,
  messagesEndRef,
  templates,
}: {
  selectedPhone: string | null;
  selectedConv: any;
  chatMessages: any[];
  fetchConversations: () => void;
  replyingTo: any;
  setReplyingTo: (r: any) => void;
  chatInput: string;
  setChatInput: (text: string) => void;
  sendingChat: boolean;
  handleSendChatMessage: (e: React.FormEvent) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  templates: any[];
}) {
  const renderWhatsAppRichText = (text: string) => {
    if (!text) return null;
    try {
      if (text.startsWith('{') && text.includes('"name":')) {
        const rawObj = JSON.parse(text);
        const templateReq = rawObj.template || rawObj;
        if (templateReq.name && templateReq.language) {
          const matchedTemplate = templates.find((t) => t.name === templateReq.name);
          
          if (!matchedTemplate) {
            return (
              <div className="flex flex-col gap-1 border-l-2 border-sv-brand pl-2 opacity-90">
                <span className="text-[10px] font-bold text-sv-brand uppercase tracking-wider">Template Sent</span>
                <span className="font-mono text-xs bg-black/10 p-2 rounded truncate max-w-[200px]">{templateReq.name}</span>
              </div>
            );
          }

          const bodyComp = matchedTemplate.components.find((c: any) => c.type === 'BODY');
          let bodyText = bodyComp ? bodyComp.text : `Template: ${templateReq.name}`;
          
          const reqBodyComp = templateReq.components?.find((c: any) => c.type === 'body');
          if (reqBodyComp && reqBodyComp.parameters) {
            reqBodyComp.parameters.forEach((param: any, idx: number) => {
              if (param.text) {
                bodyText = bodyText.replace(`{{${idx + 1}}}`, `*${param.text}*`);
              }
            });
          }

          return (
            <div className="flex flex-col gap-2 border-l-2 border-sv-brand pl-3 opacity-90 mb-1">
              <span className="text-[10px] font-bold text-sv-brand uppercase tracking-wider">
                Template Sent: {templateReq.name}
              </span>
              <div className="text-sm font-sans space-y-0.5">
                {bodyText.split("\n").map((line: string, lIdx: number) => {
                  let html = line
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\*(.*?)\*/g, '<strong class="font-bold">$1</strong>')
                    .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
                    .replace(/~(.*?)~/g, '<del class="line-through opacity-70">$1</del>')
                    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-sv-brand underline">$1</a>');
                  return <div key={lIdx} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} className="min-h-[1em]" />;
                })}
              </div>
            </div>
          );
        }
      }
    } catch (e) {}

    return text.split("\n").map((line, lIdx) => {
      let html = line
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*(.*?)\*/g, '<strong class="font-bold">$1</strong>')
        .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
        .replace(/~(.*?)~/g, '<del class="line-through opacity-70">$1</del>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-sv-brand underline">$1</a>');
      return (
        <div key={lIdx} dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} className="min-h-[1em]" />
      );
    });
  };

  if (!selectedPhone) {
    return (
      <section className="flex-1 flex flex-col h-full bg-[#E5DDD5] dark:bg-[#0b141a] relative">
        <div className="h-full flex items-center justify-center">
          <EmptyState 
            icon={<FaWhatsapp className="w-12 h-12 text-sv-brand/30" />}
            title="WhatsApp CRM" 
            description="Select a conversation from the left to start messaging."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col h-full bg-[#E5DDD5] dark:bg-[#0b141a] relative">
      {/* Chat Header */}
      <header className="bg-sv-surface border-b border-sv-border p-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Avatar name={selectedConv?.memberName || "User"} size="md" />
          <div>
            <h3 className="text-sm font-bold text-sv-text">
              {selectedConv?.memberName || `+91 ${selectedPhone}`}
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

      {/* Chat Body Wrapper */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Static Background Layer */}
        <div 
          className="absolute inset-0 pointer-events-none z-0" 
          style={{
            backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            backgroundSize: '400px',
            backgroundRepeat: 'repeat',
            opacity: 0.95
          }}
        />
        <div className="absolute inset-0 bg-[#E5DDD5]/40 dark:bg-[#0b141a]/80 pointer-events-none mix-blend-overlay z-0" />

        {/* Scrolling Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4 styled-scrollbar relative z-10">
        {chatMessages.length === 0 ? (
          <div className="m-auto bg-white/90 p-4 rounded-xl shadow-sm text-center">
            <h4 className="font-bold text-sv-text mb-1">No messages yet</h4>
            <p className="text-sm text-sv-text-muted">Start the conversation by sending a template.</p>
          </div>
        ) : (
          (() => {
            let lastDate = "";
            return chatMessages.map((msg: any, idx: number) => {
              const isOutgoing = msg.direction === "OUTGOING";
              const msgDateObj = new Date(msg.createdAt);
              const dateStr = msgDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              const showDate = dateStr !== lastDate;
              if (showDate) lastDate = dateStr;

              return (
                <React.Fragment key={idx}>
                  {showDate && (
                    <div className="flex justify-center my-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <span className="bg-white/90 dark:bg-sv-surface-raised px-3 py-1 rounded-lg shadow-sm text-[11px] font-medium text-sv-text-muted uppercase tracking-wider">
                        {dateStr}
                      </span>
                    </div>
                  )}
                  <div className={`flex flex-col group animate-in fade-in slide-in-from-bottom-2 duration-300 ${isOutgoing ? "items-end" : "items-start"}`}>
                <div className="flex items-end gap-1.5 max-w-xl">
                  {!isOutgoing && (
                    <button
                      onClick={() => setReplyingTo({ id: msg.id, wamid: msg.wamid, content: msg.content, sender: `+91 ${selectedPhone}` })}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-sv-surface hover:bg-sv-surface-hover text-sv-text-muted hover:text-sv-text transition-opacity shrink-0 mb-1"
                    >
                      <FiCornerUpLeft size={13} />
                    </button>
                  )}
                  <div
                    className={`px-3 py-2 shadow-sm relative ${
                      isOutgoing 
                        ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-sv-text rounded-lg rounded-tr-none" 
                        : "bg-white dark:bg-[#202c33] text-sv-text rounded-lg rounded-tl-none border border-black/5 dark:border-white/5"
                    }`}
                  >
                    {/* Tail SVG */}
                    {isOutgoing ? (
                      <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -right-[8px] text-[#d9fdd3] dark:text-[#005c4b]">
                        <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                        <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 8 13" width="8" height="13" className="absolute top-0 -left-[8px] text-white dark:text-[#202c33]">
                        <path opacity=".13" fill="#000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                        <path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z" />
                      </svg>
                    )}
                    {/* Context / Replied Message */}
                    {msg.contextMessageId && (
                      <div className={`text-[10px] mb-1 p-1.5 rounded border-l-2 ${isOutgoing ? 'bg-black/10 border-white/40' : 'bg-sv-bg border-sv-brand'} opacity-80 line-clamp-2`}>
                        Replying to previous message...
                      </div>
                    )}

                    <div className="text-sm font-sans space-y-1">
                      {renderWhatsAppRichText(msg.content)}
                    </div>
                    
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isOutgoing ? 'text-[#667781] dark:text-white/60' : 'text-[#667781] dark:text-white/60'}`}>
                      <span className="text-[10px] font-medium tracking-tight">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOutgoing && <MessageStatus status={msg.status} errorMessage={msg.errorMessage} />}
                    </div>
                  </div>
                  
                  {isOutgoing && (
                    <button
                      onClick={() => setReplyingTo({ id: msg.id, wamid: msg.wamid, content: msg.content, sender: `You` })}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-sv-surface hover:bg-sv-surface-hover text-sv-text-muted hover:text-sv-text transition-opacity shrink-0 mb-1"
                    >
                      <FiCornerUpLeft size={13} />
                    </button>
                  )}
                </div>
              </div>
            </React.Fragment>
            );
          })
          })()
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
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

      <ChatInputForm
        selectedConv={selectedConv}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendingChat={sendingChat}
        handleSendChatMessage={handleSendChatMessage}
        replyingTo={replyingTo}
      />
    </section>
  );
}
