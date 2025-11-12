"use client";

import { useRef } from "react";

import { useChat } from "@/context/ChatContext";

export default function FileUpload() {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const {
    state: { uploading },
    uploadFile
  } = useChat();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  return (
    <section className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-600">上傳檔案</h2>
        <p className="text-xs text-slate-400">將檔案傳送至 LocalAI，供後續對話引用。建議使用匿名化資料。</p>
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? "上傳中…" : "選擇檔案"}
      </label>
    </section>
  );
}

