import { useRoomStore } from '@/stores/roomStore';
import { useEffect, useState } from 'react';

const DISMISS_DELAY = 3000; // 반응 카드 사라지는 시간 (3초)

export default function ReactionCard() {
  const {
    role,
    isReactionOpen,
    reactionClosedAt,
    reactionCounts,
    myReaction,
    openReaction,
    closeReaction,
    resetReaction,
    submitReaction,
  } = useRoomStore();

  const [remaining, setRemainig] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (role == 'OWNER') return;

    if (isReactionOpen) {
      setVisible(true);
      setRemainig(0);
      return;
    }

    if (!reactionClosedAt) {
      setVisible(false);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - reactionClosedAt;
      const left = Math.max(0, DISMISS_DELAY - elapsed);
      setRemainig(left);
      if (left === 0) setVisible(false);
    };
    tick();
    const timer = setInterval(tick, 100);
    return () => clearInterval(timer);
  }, [isReactionOpen, reactionClosedAt, role]);

  if (role !== 'OWNER' && !visible) return null;

  const countdownPercent = reactionClosedAt ? Math.max(0, (remaining / DISMISS_DELAY) * 100) : 0;

  return (
    <div className="mx-3 mt-2 mb-1 bg-bg-base border border-border rounded flex flex-col shrink-0 overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <span className="text-[12px] font-semibold text-text-primary">이해도 반응</span>
        {role === 'OWNER' && (
          <div className="flex items-center gap-2">
            <button
              className="text-[11px] text-text-dim hover:text-accent-red transition-colors"
              onClick={resetReaction}
            >
              초기화
            </button>
            <button
              className={`text-[11px] px-2 py-[2px] rounded font-medium transition-colors ${
                isReactionOpen
                  ? 'bg-bg-hover text-text-secondary hover:text-accent-red'
                  : 'bg-[#007acc] text-white hover:opacity-80'
              }`}
              onClick={isReactionOpen ? closeReaction : openReaction}
            >
              {isReactionOpen ? '종료' : '시작'}
            </button>
          </div>
        )}
      </div>

      {/* 투표 버튼 */}
      <div className="flex gap-2 px-3 pb-3">
        {/* 이해했어요 */}
        <button
          disabled={role === 'OWNER'}
          className={`flex-1 aspect-square flex flex-col items-center justify-center gap-1 rounded border-2 transition-colors ${
            myReaction === 'understand'
              ? 'border-accent-green bg-accent-green text-white'
              : 'border-border text-text-secondary hover:border-accent-green hover:text-accent-green disabled:hover:border-border disabled:hover:text-text-secondary disabled:cursor-default'
          }`}
          onClick={() => submitReaction('understand')}
        >
          <span className="text-[20px]">✅</span>
          <span className="text-[11px] font-medium">이해했어요</span>
          <span className="text-[11px] text-current opacity-70">{reactionCounts.understand}명</span>
        </button>

        {/* 잘 모르겠어요 */}
        <button
          disabled={role === 'OWNER'}
          className={`flex-1 aspect-square flex flex-col items-center justify-center gap-1 rounded border-2 transition-colors ${
            myReaction === 'confused'
              ? 'border-accent-red bg-accent-red text-white'
              : 'border-border text-text-secondary hover:border-accent-red hover:text-accent-red disabled:hover:border-border disabled:hover:text-text-secondary disabled:cursor-default'
          }`}
          onClick={() => submitReaction('confused')}
        >
          <span className="text-[20px]">❓</span>
          <span className="text-[11px] font-medium">잘 모르겠어요</span>
          <span className="text-[11px] text-current opacity-70">{reactionCounts.confused}명</span>
        </button>
      </div>

      {/* USER 카운트다운 progress bar */}
      {role === 'USER' && !isReactionOpen && reactionClosedAt && (
        <div className="h-[3px] bg-bg-hover w-full">
          <div
            className="h-full bg-[#007acc] transition-none"
            style={{ width: `${countdownPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
