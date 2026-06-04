import { api } from './instance';
import type { ChatHistoryResponse } from '@/types/chat';

/**
 * 커서 기반 채팅 히스토리 페이지네이션 조회
 * @param roomId - 조회할 강의룸의 ID
 * @param cursor - 이전 페이지 마지막 메시지의 ID
 * @param limit 한번에 가져올 메시지의 수
 * @returns 메시지 목록, 다음 커서, 추가 페이지 존재 여부
 */
export const fetchChatHistory = async (
  roomId: number,
  cursor?: number,
  limit = 50,
): Promise<ChatHistoryResponse> => {
  const params: Record<string, unknown> = { limit };
  if (cursor !== undefined) params.cursor = cursor;

  const { data } = await api.get(`/api/rooms/${roomId}/chat`, { params });
  return data.data;
};
