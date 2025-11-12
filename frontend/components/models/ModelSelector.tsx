"use client";

import { useChat } from "@/context/ChatContext";

export default function ModelSelector() {
  const {
    state: { models, selectedModel, loadingModels },
    selectModel
  } = useChat();

  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-600">模型選擇</h2>
        {loadingModels ? <span className="text-xs text-slate-400">載入中...</span> : null}
      </div>
      <select
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring focus:ring-sky-200"
        value={selectedModel ?? ""}
        onChange={(event) => selectModel(event.target.value)}
        disabled={!models.length}
      >
        {models.length ? null : <option value="">尚無可用模型</option>}
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-400">模型列表由 LocalAI /models API 提供。</p>
    </section>
  );
}

