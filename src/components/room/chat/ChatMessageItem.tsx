import type { ChatMessage } from '@/types/chat';

interface ChatMessageItemProps {
  message: ChatMessage;
  isMyMessage: boolean;
  isOwnerMessage?: boolean;
}

/**
 * 채팅 메시지 아이템 컴포넌트
 * - 내 메시지는 오른쪽 정렬, 다른 사람 메시지는 왼쪽 정렬
 * - OWNER 메시지는 강조 스타일 적용
 */
export default function ChatMessageItem({
  message,
  isMyMessage,
  isOwnerMessage,
}: ChatMessageItemProps) {
  /** 시간대 KST 기준으로 변환 */
  const normalized = /Z|[+-]\d{2}:\d{2}$/.test(message.createdAt)
    ? message.createdAt
    : `${message.createdAt}Z`;

  const timeStr = new Date(normalized).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className={`flex flex-col gap-[2px] px-2 py-1 ${isMyMessage ? 'items-end' : 'items-start'}`}
    >
      {!isMyMessage && (
        <div className="flex items-baseline gap-1.5">
          <span
            className={`text-[12px] font-medium ${isOwnerMessage ? 'text-accent-orange' : 'text-text-primary'}`}
          >
            {message.nickname}
          </span>
          <span className="text-[11px] text-text-dim">{timeStr}</span>
        </div>
      )}
      <div
        className={`max-w-[85%] px-3 py-1.5 rounded text-[13px] leading-relaxed break-words ${
          isMyMessage
            ? 'bg-[#007acc] text-white'
            : isOwnerMessage
              ? 'bg-accent-orange text-white font-semibold text-[14px] ring-1 ring-accent-orange/40'
              : 'bg-bg-hover text-text-secondary'
        }`}
      >
        {message.content}
      </div>
      {isMyMessage && <span className="text-[11px] text-text-dim">{timeStr}</span>}
    </div>
  );
}
