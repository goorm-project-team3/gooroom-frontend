import { fetchChatHistory } from '@/api/chat';
import { useChatStore } from '@/stores/chatStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * 채팅 히스토리를 조회하고 store에 저장하는 훅
 * @param roomId - 조회할 강의룸의 ID
 * @returns React Query의 쿼리 객체 (히스토리 데이터, 로딩/에러 상태 등 포함)
 */
export const useChatHistory = (roomId: number) => {
  const setHistory = useChatStore((state) => state.setHistory);

  const query = useQuery({
    queryKey: ['chat-history', roomId],
    queryFn: () => fetchChatHistory(roomId),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!query.data) return;

    const ordered = [...query.data.messages];
    setHistory(ordered, query.data.nextCursor, query.data.hasMore);
  }, [query.data, setHistory]);
  return query;
};
