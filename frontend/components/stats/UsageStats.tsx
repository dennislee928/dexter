"use client";

import { useMemo } from "react";

import { useChat } from "@/context/ChatContext";

export default function UsageStats() {
  const {
    state: { stats, messages }
  } = useChat();

  const summary = useMemo(() => {
    if (!stats) {
      const totalTokens = messages.reduce((sum, message) => sum + (message.tokens ?? 0), 0);
      return {
        totalMessages: messages.length,
        totalTokens,
        uploadedFiles: messages.filter((message) => message.metadata?.kind === "file").length,
        lastUpdated: null
      };
    }
    return stats;
  }, [stats, messages]);

  return (
    <section className="glass-panel flex flex-col gap-4 p-5">
      <header>
        <h2 className="text-base font-semibold text-slate-700">使用統計</h2>
        <p className="text-xs text-slate-400">即時彙整本次對話的訊息量與估計 token 數。</p>
      </header>
      <dl className="grid grid-cols-2 gap-4 text-sm text-slate-500">
        <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
          <dt className="text-xs uppercase tracking-wide text-slate-400">訊息數</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-800">{summary.totalMessages}</dd>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
          <dt className="text-xs uppercase tracking-wide text-slate-400">估計 Tokens</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-800">{summary.totalTokens}</dd>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
          <dt className="text-xs uppercase tracking-wide text-slate-400">檔案數</dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-800">{summary.uploadedFiles}</dd>
        </div>
        <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
          <dt className="text-xs uppercase tracking-wide text-slate-400">最後更新</dt>
          <dd className="mt-2 text-sm text-slate-600">
            {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString("zh-TW") : "尚未統計"}
          </dd>
        </div>
      </dl>
    </section>
  );
}

