"use client";

import { useEffect, useRef } from "react";

import { useChat } from "@/context/ChatContext";
import MessageInput from "@/components/chat/MessageInput";
import MessageList from "@/components/chat/MessageList";

export default function ChatWindow() {
  const {
    state: { messages, error },
    sendMessage
  } = useChat();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex h-full flex-col gap-4">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}
      <div ref={containerRef} className="scrollbar-thin flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-inner">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSubmit={sendMessage} />
    </div>
  );
}

