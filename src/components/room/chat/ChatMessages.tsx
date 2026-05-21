import { useChatStore } from '@/stores/chatStore';
import { useRoomStore } from '@/stores/roomStore';
import { useEffect, useRef } from 'react';

export default function ChatMessages() {
  const { messages } = useChatStore();
  const { members } = useRoomStore();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // 메시지가 추가될 때마다 스크롤이 내려가도록 변경 예정

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-3">
      {messages.map((msg) => {
        const isOwner = members.find((m) => m.id === msg.senderId)?.role === 'OWNER';

        return (
          <div
            key={msg.id}
            className={`flex flex-col gap-[2px] px-2 py-1 rounded ${
              isOwner ? 'border-l-2 border-l-[#f59e0b] bg-bg-hover' : ''
            }`}
          >
            <div className="flex items-baseline gap-2">
              <span
                className={`text-[12px] font-medium ${isOwner ? 'text-accent-orange' : 'text-text-primary'}`}
              >
                {msg.senderName}
              </span>
              {isOwner && (
                <span className="text-[10px] text-accent-orange font-semibold">강사</span>
              )}
              <span className="text-[11px] text-text-dim">{msg.timestamp}</span>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed break-words">
              {msg.content}
            </p>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
