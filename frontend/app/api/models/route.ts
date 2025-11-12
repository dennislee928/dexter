import { NextResponse } from "next/server";

import { handleLocalAiError, localAiFetch } from "@/lib/server/localai";

export const dynamic = "force-dynamic";

type LocalAIModel = {
  id?: string;
  name?: string;
};

export async function GET() {
  try {
    const response = await localAiFetch("/models", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json({ error: message || "LocalAI 無法提供模型列表" }, { status: response.status });
    }

    const payload = (await response.json()) as { data?: LocalAIModel[] };
    const models =
      payload.data?.map((item) => item.id ?? item.name ?? "").filter((id): id is string => Boolean(id)) ?? [];

    return NextResponse.json({ data: models });
  } catch (error) {
    return handleLocalAiError(error);
  }
}

