export type ChatRole = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  tokens?: number;
  metadata?: Record<string, unknown>;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  model: string;
};

export type UsageSnapshot = {
  conversationId: string;
  totalMessages: number;
  totalTokens: number;
  uploadedFiles: number;
  lastUpdated: string;
};

