"use client";

import { useState } from "react";

import { useChat } from "@/context/ChatContext";

export default function SystemPromptEditor() {
  const {
    state: { systemPrompt },
    setSystemPrompt
  } = useChat();
  const [value, setValue] = useState(systemPrompt);
  const [dirty, setDirty] = useState(false);

  const handleBlur = () => {
    if (!dirty) return;
    setSystemPrompt(value);
    setDirty(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600">系統提示（System Prompt）</h2>
        {dirty ? <span className="text-xs text-sky-500">尚未同步</span> : null}
      </div>
      <textarea
        className="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring focus:ring-sky-200"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setDirty(true);
        }}
        onBlur={handleBlur}
        placeholder="自訂代理的系統角色描述。"
      />
      <p className="mt-2 text-xs text-slate-400">離開輸入框即會同步至後續對話。</p>
    </section>
  );
}

