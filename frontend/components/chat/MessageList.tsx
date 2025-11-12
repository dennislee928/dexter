"use client";

import type { ChatMessage } from "@/types/chat";

type Props = {
  messages: ChatMessage[];
};

const roleMap: Record<string, { label: string; bubble: string }> = {
  user: { label: "你", bubble: "bg-slate-900 text-white" },
  assistant: { label: "Dexter", bubble: "bg-sky-100 text-slate-800 border border-sky-200" },
  system: { label: "系統", bubble: "bg-amber-100 text-amber-900 border border-amber-200" },
  tool: { label: "工具", bubble: "bg-emerald-100 text-emerald-900 border border-emerald-200" }
};

function formatTimestamp(iso: string) {
  try {
    return new Intl.DateTimeFormat("zh-Hant", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function MessageList({ messages }: Props) {
  if (!messages.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
        <span>尚未開始對話。</span>
        <span>選擇模型、設定系統提示，然後輸入問題即可開始。</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const mapping = roleMap[message.role] ?? { label: message.role, bubble: "bg-slate-200 text-slate-800" };
        return (
          <article key={message.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-500">{mapping.label}</span>
              <span>·</span>
              <time dateTime={message.createdAt}>{formatTimestamp(message.createdAt)}</time>
              {typeof message.tokens === "number" ? (
                <>
                  <span>·</span>
                  <span>{message.tokens} tokens (估計)</span>
                </>
              ) : null}
            </div>
            <div className={`max-w-3xl whitespace-pre-line rounded-2xl px-4 py-3 text-sm shadow-sm ${mapping.bubble}`}>
              {message.content}
            </div>
          </article>
        );
      })}
    </div>
  );
}

