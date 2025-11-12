"use client";

import { useChat } from "@/context/ChatContext";

export default function ConversationHistory() {
  const {
    state: { conversations },
    loadConversation,
    resetConversation
  } = useChat();

  if (!conversations.length) {
    return (
      <section className="glass-panel flex flex-col gap-3 p-5 text-sm text-slate-500">
        <h2 className="text-base font-semibold text-slate-700">對話紀錄</h2>
        <p>目前沒有歷史紀錄，開始新的對話以建立紀錄。</p>
      </section>
    );
  }

  return (
    <section className="glass-panel flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-700">對話紀錄</h2>
        <button
          type="button"
          onClick={resetConversation}
          className="text-xs text-slate-400 transition hover:text-slate-600"
        >
          清空當前視窗
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => loadConversation(conversation.id)}
              className="w-full rounded-xl border border-transparent bg-white/70 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-sky-200 hover:bg-sky-50"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{conversation.title}</span>
                <span className="text-xs text-slate-400">{new Date(conversation.createdAt).toLocaleString("zh-TW")}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">模型：{conversation.model}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

