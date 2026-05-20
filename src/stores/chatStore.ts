import { create } from 'zustand';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface ChatStore {
  messages: Message[];
  addMessage: (content: string, senderId: string, senderName: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [
    {
      id: 'm-1',
      senderId: 'user-1',
      senderName: '김강사',
      content: '안녕하세요! 오늘 강의를 시작하겠습니다.',
      timestamp: '14:00',
    },
    {
      id: 'm-2',
      senderId: 'user-2',
      senderName: '박학생',
      content: '안녕하세요!',
      timestamp: '14:01',
    },
    {
      id: 'm-3',
      senderId: 'user-3',
      senderName: '이학생',
      content: '잘 부탁드립니다',
      timestamp: '14:01',
    },
    {
      id: 'm-4',
      senderId: 'user-1',
      senderName: '김강사',
      content: '오늘은 TypeScript 기초부터 시작할게요.',
      timestamp: '14:02',
    },
  ],
  addMessage: (content, senderId, senderName) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `m-${Date.now()}`,
          senderId,
          senderName,
          content,
          timestamp: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        },
      ],
    })),
}));
