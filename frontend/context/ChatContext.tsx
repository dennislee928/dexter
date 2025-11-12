"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

import { fetchModels, sendChatCompletion, uploadFileToLocalAI } from "@/lib/api";
import { estimateTokenUsage } from "@/lib/tokens";
import type { ChatMessage, Conversation, UsageSnapshot } from "@/types/chat";

type ChatState = {
  models: string[];
  selectedModel: string | null;
  systemPrompt: string;
  messages: ChatMessage[];
  conversations: Conversation[];
  stats: UsageSnapshot | null;
  uploading: boolean;
  loadingModels: boolean;
  error: string | null;
};

type Action =
  | { type: "SET_MODELS"; payload: string[] }
  | { type: "SET_MODEL"; payload: string }
  | { type: "SET_SYSTEM_PROMPT"; payload: string }
  | { type: "APPEND_MESSAGE"; payload: ChatMessage }
  | { type: "REPLACE_MESSAGES"; payload: ChatMessage[] }
  | { type: "ADD_CONVERSATION"; payload: Conversation }
  | { type: "UPDATE_CONVERSATION"; payload: Conversation }
  | { type: "SET_STATS"; payload: UsageSnapshot }
  | { type: "SET_UPLOADING"; payload: boolean }
  | { type: "SET_LOADING_MODELS"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const INITIAL_STATE: ChatState = {
  models: [],
  selectedModel: null,
  systemPrompt: "You are Dexter running against LocalAI. Be concise, cite sources when possible.",
  messages: [],
  conversations: [],
  stats: null,
  uploading: false,
  loadingModels: false,
  error: null
};

function chatReducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case "SET_MODELS":
      return {
        ...state,
        models: action.payload,
        selectedModel: state.selectedModel ?? action.payload[0] ?? null
      };
    case "SET_MODEL":
      return { ...state, selectedModel: action.payload };
    case "SET_SYSTEM_PROMPT":
      return { ...state, systemPrompt: action.payload };
    case "APPEND_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "REPLACE_MESSAGES":
      return { ...state, messages: action.payload };
    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
        stats: deriveStats(action.payload, state.stats)
      };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((c) => (c.id === action.payload.id ? action.payload : c)),
        stats: deriveStats(action.payload, state.stats)
      };
    case "SET_STATS":
      return { ...state, stats: action.payload };
    case "SET_UPLOADING":
      return { ...state, uploading: action.payload };
    case "SET_LOADING_MODELS":
      return { ...state, loadingModels: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

type ChatContextValue = {
  state: ChatState;
  sendMessage: (input: string) => Promise<void>;
  resetConversation: () => void;
  setSystemPrompt: (prompt: string) => void;
  selectModel: (model: string) => void;
  uploadFile: (file: File) => Promise<void>;
  loadConversation: (conversationId: string) => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function nowISO(): string {
  return new Date().toISOString();
}

function generateConversationTitle(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return "未命名對話";
  }
  return trimmed.length > 32 ? `${trimmed.slice(0, 32)}…` : trimmed;
}

function deriveStats(conversation: Conversation, current: UsageSnapshot | null): UsageSnapshot {
  const totalMessages = conversation.messages.length;
  const totalTokens = conversation.messages.reduce((acc, message) => acc + (message.tokens ?? 0), 0);
  const uploadedFiles =
    conversation.messages.filter((message) => message.metadata && message.metadata.kind === "file").length;

  return {
    conversationId: conversation.id,
    totalMessages,
    totalTokens,
    uploadedFiles,
    lastUpdated: nowISO()
  };
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  useEffect(() => {
    let disposed = false;
    const loadModels = async () => {
      dispatch({ type: "SET_LOADING_MODELS", payload: true });
      try {
        const models = await fetchModels();
        if (!disposed) {
          dispatch({ type: "SET_MODELS", payload: models });
        }
      } catch (error) {
        console.error(error);
        if (!disposed) {
          dispatch({ type: "SET_ERROR", payload: "無法載入模型列表，請確認 LocalAI 是否啟動。" });
        }
      } finally {
        if (!disposed) {
          dispatch({ type: "SET_LOADING_MODELS", payload: false });
        }
      }
    };

    void loadModels();

    return () => {
      disposed = true;
    };
  }, []);

  const resetConversation = useCallback(() => {
    dispatch({ type: "REPLACE_MESSAGES", payload: [] });
  }, []);

  const setSystemPrompt = useCallback((prompt: string) => {
    dispatch({ type: "SET_SYSTEM_PROMPT", payload: prompt });
  }, []);

  const selectModel = useCallback((model: string) => {
    dispatch({ type: "SET_MODEL", payload: model });
  }, []);

  const loadConversation = useCallback(
    (conversationId: string) => {
      const conversation = state.conversations.find((c) => c.id === conversationId);
      if (!conversation) {
        return;
      }
      dispatch({ type: "REPLACE_MESSAGES", payload: conversation.messages });
      dispatch({ type: "SET_MODEL", payload: conversation.model });
      dispatch({ type: "SET_STATS", payload: deriveStats(conversation, state.stats) });
    },
    [state.conversations, state.stats]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      dispatch({ type: "SET_UPLOADING", payload: true });
      try {
        const metadata = await uploadFileToLocalAI(file);
        const message: ChatMessage = {
          id: crypto.randomUUID(),
          role: "user",
          content: `檔案已上傳：${metadata.filename}`,
          createdAt: nowISO(),
          metadata: { ...metadata, kind: "file" }
        };
        dispatch({ type: "APPEND_MESSAGE", payload: message });
      } catch (error) {
        console.error(error);
        dispatch({ type: "SET_ERROR", payload: "檔案上傳失敗，請稍後再試。" });
      } finally {
        dispatch({ type: "SET_UPLOADING", payload: false });
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        return;
      }
      const model = state.selectedModel;
      if (!model) {
        dispatch({ type: "SET_ERROR", payload: "尚未選擇模型。" });
        return;
      }

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
        createdAt: nowISO()
      };

      dispatch({ type: "APPEND_MESSAGE", payload: userMessage });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const completion = await sendChatCompletion({
          model,
          systemPrompt: state.systemPrompt,
          messages: [...state.messages, userMessage]
        });

        const messagesWithUsage: ChatMessage[] = completion.messages.map((item) => ({
          ...item,
          tokens: estimateTokenUsage(item.content)
        }));

        for (const message of messagesWithUsage) {
          dispatch({ type: "APPEND_MESSAGE", payload: message });
        }

        const conversationId = state.conversations[0]?.id ?? crypto.randomUUID();
        const nextConversation: Conversation =
          state.conversations.find((c) => c.id === conversationId) ??
          ({
            id: conversationId,
            title: generateConversationTitle(userMessage.content),
            createdAt: nowISO(),
            model,
            messages: [...state.messages, userMessage, ...messagesWithUsage]
          } as Conversation);

        nextConversation.messages = [...state.messages, userMessage, ...messagesWithUsage];

        if (state.conversations.some((c) => c.id === conversationId)) {
          dispatch({ type: "UPDATE_CONVERSATION", payload: nextConversation });
        } else {
          dispatch({ type: "ADD_CONVERSATION", payload: nextConversation });
        }
      } catch (error) {
        console.error(error);
        dispatch({ type: "SET_ERROR", payload: "LocalAI 回應失敗，請稍後再試。" });
      }
    },
    [state.selectedModel, state.systemPrompt, state.messages, state.conversations]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      sendMessage,
      resetConversation,
      setSystemPrompt,
      selectModel,
      uploadFile,
      loadConversation
    }),
    [state, sendMessage, resetConversation, setSystemPrompt, selectModel, uploadFile, loadConversation]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat 必須在 ChatProvider 中使用");
  }
  return context;
};

