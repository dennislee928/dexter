import { NextResponse } from "next/server";

import { handleLocalAiError, localAiFetch } from "@/lib/server/localai";
import type { ChatMessage } from "@/types/chat";

export const dynamic = "force-dynamic";

type IncomingMessage = {
  id: string;
  role: ChatMessage["role"];
  content: string;
  createdAt: string;
};

type LocalAIChoice = {
  message?: {
    role?: string;
    content?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      model: string;
      systemPrompt: string;
      messages: IncomingMessage[];
    };

    if (!body.model) {
      return NextResponse.json({ error: "缺少模型參數" }, { status: 400 });
    }

    const openAiMessages = [
      { role: "system", content: body.systemPrompt },
      ...body.messages.map((message) => ({
        role: message.role,
        content: message.content
      }))
    ];

    const response = await localAiFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: body.model,
        messages: openAiMessages,
        stream: false
      })
    });

    if (!response.ok) {
      let errorMessage = "LocalAI 回應失敗";
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = typeof errorData.error === "string" 
            ? errorData.error 
            : errorData.error.message || JSON.stringify(errorData.error);
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
      console.error("[Chat API] LocalAI error:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const completion = (await response.json()) as { choices?: LocalAIChoice[] };
    const assistantMessages =
      completion.choices?.map((choice) => {
        const role = (choice.message?.role ?? "assistant") as ChatMessage["role"];
        const content = choice.message?.content ?? "";
        return {
          id: crypto.randomUUID(),
          role,
          content,
          createdAt: new Date().toISOString()
        };
      }) ?? [];

    return NextResponse.json({ messages: assistantMessages });
  } catch (error) {
    return handleLocalAiError(error);
  }
}

