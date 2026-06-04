export interface ChatMessage {
  messageId: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
  role: 'OWNER' | 'USER';
}

export interface ChatBroadcast {
  type: 'CHAT';
  messageId: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
  role: 'OWNER' | 'USER';
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface ChatSendPayload {
  content: string;
}
