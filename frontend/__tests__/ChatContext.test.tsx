import { act, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ChatProvider, useChat } from "@/context/ChatContext";

const fetchModelsMock = vi.fn();
const sendChatMock = vi.fn();
const uploadFileMock = vi.fn();

vi.mock("@/lib/api", () => ({
  fetchModels: () => fetchModelsMock(),
  sendChatCompletion: (payload: unknown) => sendChatMock(payload),
  uploadFileToLocalAI: (file: File) => uploadFileMock(file)
}));

const TestHarness = () => {
  const { state, sendMessage, selectModel } = useChat();
  return (
    <div>
      <span data-testid="selected-model">{state.selectedModel ?? "none"}</span>
      <span data-testid="message-count">{state.messages.length}</span>
      <button
        type="button"
        data-testid="send-message"
        onClick={async () => {
          await sendMessage("Hello LocalAI");
        }}
      >
        send
      </button>
      <button
        type="button"
        data-testid="set-model"
        onClick={() => selectModel("alt-model")}
      >
        set-model
      </button>
    </div>
  );
};

beforeEach(() => {
  fetchModelsMock.mockReset();
  sendChatMock.mockReset();
  uploadFileMock.mockReset();

  fetchModelsMock.mockResolvedValue(["local-model"]);
  sendChatMock.mockResolvedValue({
    messages: [
      {
        id: "assistant-1",
        role: "assistant",
        content: "回覆內容",
        createdAt: new Date().toISOString()
      }
    ]
  });
});

describe("ChatProvider", () => {
  it("loads models on mount and selects the first one", async () => {
    render(
      <ChatProvider>
        <TestHarness />
      </ChatProvider>
    );

    await waitFor(() => {
      expect(fetchModelsMock).toHaveBeenCalled();
    });

    expect(screen.getByTestId("selected-model").textContent).toBe("local-model");
  });

  it("appends user and assistant messages when sending chat", async () => {
    // Mock crypto.randomUUID to ensure deterministic IDs in tests.
    let restoreRandomUUID: (() => void) | null = null;
    if ("randomUUID" in crypto && typeof crypto.randomUUID === "function") {
      const spy = vi.spyOn(crypto, "randomUUID").mockReturnValue("user-uuid");
      restoreRandomUUID = () => spy.mockRestore();
    } else {
      const originalCrypto = { ...crypto };
      vi.stubGlobal("crypto", { ...crypto, randomUUID: () => "user-uuid" });
      restoreRandomUUID = () => {
        vi.stubGlobal("crypto", originalCrypto);
      };
    }

    render(
      <ChatProvider>
        <TestHarness />
      </ChatProvider>
    );

    await waitFor(() => expect(fetchModelsMock).toHaveBeenCalled());

    const button = screen.getByTestId("send-message");
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(sendChatMock).toHaveBeenCalled();
      expect(Number(screen.getByTestId("message-count").textContent)).toBeGreaterThanOrEqual(2);
    });

    restoreRandomUUID?.();
  });
});

