import { create } from 'zustand';
import type { ChatMessage } from '@/types/chat';

interface ChatState {
  messages: ChatMessage[];
  nextCursor: number | null;
  hasMore: boolean;
  isConnected: boolean;

  setHistory: (messages: ChatMessage[], nextCursor: number | null, hasMore: boolean) => void;
  prependMessages: (messages: ChatMessage[], nextCursor: number | null, hasMore: boolean) => void;
  appendMessage: (message: ChatMessage) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const initialState = {
  messages: [] as ChatMessage[],
  nextCursor: null,
  hasMore: false,
  isConnected: false,
};

/**
 * 채팅 메시지 상태 관리 스토어
 * 초기 히스토리 로딩, 무한스크롤 prepend, 실시간 메시지 append를 분리하여 관리
 */
export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  /**
   * 초기 히스토리를 store에 설정
   * useChatHistory 훅에서 최초 로딩 시 호출
   */
  setHistory: (messages, nextCursor, hasMore) => set({ messages, nextCursor, hasMore }),

  /**
   * 이전 메시지를 목록 앞에 추가
   */
  prependMessages: (messages, nextCursor, hasMore) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
      nextCursor,
      hasMore,
    })),

    /**
     * 실시간으로 수신한 새 메시지를 목록 뒤에 추가
     * WebSocket 수신 시 호출
     */
  appendMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  /**
   * WebSocket 연결 상태 업데이트
   * 연결 상태에 따라 UI에서 연결 여부 표시 등에 활용
   */
  setConnected: (connected) => set({ isConnected: connected }),

  /**
   * store 초기화
   */
  reset: () => set(initialState),
}));
