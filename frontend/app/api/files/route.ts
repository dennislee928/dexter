import { NextResponse } from "next/server";

import { handleLocalAiError, localAiFetch } from "@/lib/server/localai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "缺少檔案內容" }, { status: 400 });
    }

    const proxyForm = new FormData();
    proxyForm.append("file", file);

    const response = await localAiFetch("/files", {
      method: "POST",
      body: proxyForm
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json({ error: message || "LocalAI 檔案上傳失敗" }, { status: response.status });
    }

    const payload = (await response.json()) as {
      id: string;
      filename: string;
      bytes: number;
      created_at: string;
    };

    return NextResponse.json({
      id: payload.id,
      filename: payload.filename,
      bytes: payload.bytes,
      createdAt: payload.created_at
    });
  } catch (error) {
    return handleLocalAiError(error);
  }
}

