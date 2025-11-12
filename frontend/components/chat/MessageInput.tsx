"use client";

import { useState } from "react";

type Props = {
  onSubmit: (message: string) => Promise<void>;
};

export default function MessageInput({ onSubmit }: Props) {
  const [value, setValue] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(value);
      setValue("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/70 p-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-28 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring focus:ring-sky-200"
        placeholder="輸入問題，Dexter 將透過 LocalAI 回應。"
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Shift + Enter 換行 · Enter 送出</p>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting || !value.trim()}
        >
          {isSubmitting ? "傳送中..." : "送出訊息"}
        </button>
      </div>
    </form>
  );
}

