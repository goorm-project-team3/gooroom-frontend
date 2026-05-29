import { useEffect, useRef, useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useRoomStore } from '@/stores/roomStore';
import { fetchChatHistory } from '@/api/chat';
import ChatMessageItem from './ChatMessageItem';

const getDateLabel = (dateStr: string) => {
  const normalized = /Z|[+-]\d{2}:\d{2}$/.test(dateStr) ? dateStr : `${dateStr}Z`;

  const msgDate = new Date(normalized).toDateString();
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (msgDate === today) return '오늘';
  if (msgDate === yesterday) return '어제';

  return new Date(normalized).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 채팅 메시지 목록을 렌더링하는 컴포넌트
 * 새 메시지 수신 시 자동 스크롤
 * 상단 스크롤 시 이전 메시지 로드 (무한 스크롤)
 */
export default function ChatMessages() {
  const { messages, hasMore, nextCursor, prependMessages } = useChatStore();
  const myUserId = useRoomStore((s) => s.myUserId);
  const roomId = useRoomStore((s) => s.roomId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPrepending = useRef(false);

  // 새 메시지 append 시 자동 스크롤 (prepend 중에는 스킵)
  useEffect(() => {
    if (isPrepending.current) return;
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length]);

  /**
   * 스크롤 이벤트 핸들러
   * - 스크롤이 상단에 가까워지면 이전 메시지 로드 시도
   */
  const handleScroll = useCallback(async () => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || !roomId || isPrepending.current) return;

    if (container.scrollTop < 100) {
      isPrepending.current = true;
      const prevScrollHeight = container.scrollHeight;

      try {
        const data = await fetchChatHistory(Number(roomId), nextCursor ?? undefined);
        const older = [...data.messages];
        prependMessages(older, data.nextCursor, data.hasMore);

        // prepend 후 스크롤 위치 보정 — 사용자 시점을 유지한다
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop += container.scrollHeight - prevScrollHeight;
          }
          isPrepending.current = false;
        });
      } catch {
        isPrepending.current = false;
      }
    }
  }, [hasMore, nextCursor, roomId, prependMessages]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-2 p-3">
      {messages.map((msg, i) => {
        const toDay = (str: string) => {
          const s = /Z|[+-]\d{2}:\d{2}$/.test(str) ? str : `${str}Z`;
          return new Date(s).toDateString();
        };

        const prevMsg = messages[i - 1];
        const msgDay = toDay(msg.createdAt);
        const prevDay = prevMsg ? toDay(prevMsg.createdAt) : null;
        const showDateSeparator = msgDay !== prevDay;
        return (
          <>
            {showDateSeparator && (
              <div key={`sep-${msgDay}`} className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-text-dim shrink-0">
                  {getDateLabel(msg.createdAt)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <ChatMessageItem
              key={msg.messageId}
              message={msg}
              isMyMessage={msg.userId === myUserId}
              isOwnerMessage={msg.role === 'OWNER'}
            />
          </>
        );
      })}
    </div>
  );
}
