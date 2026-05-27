import ChatInput from '../chat/ChatInput';
import ChatMessages from '../chat/ChatMessages';
import ReactionBar, { type ReactionBarHandle } from '../chat/ReactionBar';
import ReactionCard from '../chat/ReactionCard';
import { useRoomStore } from '@/stores/roomStore';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useRef, useState, useCallback } from 'react';
import { useReactionSocket } from '@/hooks/useReactionSocket';
import type { EmojiReactionBroadcast } from '@/types/emojiReaction';
import type { UnderstandingReactionBroadcast } from '@/types/understandingReaction';
import { useUnderstandingReactionSocket } from '@/hooks/useUnderstandingReactionSocket';

const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function RightPanel() {
  const syncUnderstandingReaction = useRoomStore((s) => s.syncUnderstandingReaction);
  const roomId = useRoomStore((s) => s.roomId);
  const numericRoomId = roomId ? Number(roomId) : 0;
  const myUserId = useRoomStore((s) => s.myUserId);

  /** ReactionBar의 showFloatingFromBar 메서드에 대한 참조 */
  const reactionBarRef = useRef<ReactionBarHandle>(null);

  /**
   * 브로드캐스트 수신 시 ReactionBar에 애니메이션을 표시하는 콜백
   *
   * @param broadcast 수신된 이모지 리액션 브로드캐스트 페이로드
   */
  const handleReactionReceive = useCallback(
    (broadcast: EmojiReactionBroadcast) => {
      if (broadcast.userId === myUserId) return; // 본인 발송 리액션은 이미 버튼 클릭 시 애니메이션 처리했으므로 무시
      reactionBarRef.current?.showFloatingFromBar(broadcast.emoji);
    },
    [myUserId],
  );

  const handleUnderstandingReactionReceive = useCallback(
    (broadcast: UnderstandingReactionBroadcast) => {
      syncUnderstandingReaction(broadcast.isOpen, broadcast.counts, broadcast.closedAt);
    },
    [syncUnderstandingReaction],
  );

  const { send } = useUnderstandingReactionSocket({
    roomId: numericRoomId,
    onReceive: handleUnderstandingReactionReceive,
  });

  useChatHistory(numericRoomId);

  const { sendMessage } = useChatSocket(numericRoomId);

  const { sendReaction } = useReactionSocket({
    roomId: numericRoomId,
    onReceive: handleReactionReceive,
  });

  const [width, setWidth] = useState(280);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const delta = startX.current - e.clientX; // 왼쪽으로 드래그 = 폭 증가
        const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
        setWidth(next);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [width],
  );

  return (
    <div
      style={{ width }}
      className="bg-bg-panel shrink-0 flex flex-col overflow-hidden border-l border-border relative"
    >
      {/* 리사이즈 핸들 */}
      <div
        onMouseDown={onMouseDown}
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-accent-blue/50 transition-colors"
      />

      {/* 헤더 */}
      <div className="px-4 py-2 shrink-0 border-b border-border">
        <span className="text-[11px] font-semibold text-text-dim uppercase tracking-widest">
          CHAT
        </span>
      </div>

      <ReactionCard send={send} />
      <ChatMessages />
      <ReactionBar ref={reactionBarRef} sendReaction={sendReaction} />
      <ChatInput onSend={sendMessage} />
    </div>
  );
}
