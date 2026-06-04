import { useCallback, useRef, useState, useImperativeHandle, forwardRef } from 'react';

// 이모지 위치 및 정보
interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface ReactionbarProps {
  /**
   * STOMP를 통해 이모지를 서버로 전송하는 함수
   */
  sendReaction: (emoji: string) => void;
}

/**
 * 브로드캐스트 수신 시 부모가 직접 애니메이션을 트리거하기 위해 사용
 */
export interface ReactionBarHandle {
  /**
   * 이모지 문자열에 해당하는 버튼의 위치에서 애니메이션 표시
   */
  showFloatingFromBar: (emoji: string) => void;
}

const EMOJIS = ['👍', '❤️', '👏'];

const ReactionBar = forwardRef<ReactionBarHandle, ReactionbarProps>(({ sendReaction }, ref) => {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const idRef = useRef(0);

  /**
   * 지정한 좌표에 이모지 애니메이션을 표시
   * 발송자와 수신자 양쪽에서 사용
   *
   * @param emoji 표시할 이모지 문자열
   * @param x 화면의 x 좌표
   * @param y 화면의 y 좌표
   */
  const showFloating = useCallback((emoji: string, x: number, y: number) => {
    const id = ++idRef.current;
    setFloatingEmojis((prev) => [...prev, { id, emoji, x, y }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((fe) => fe.id !== id));
    }, 800);
  }, []);

  /**
   * 이모지 버튼 엘리먼트들을 저장하는 map
   */
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /**
   * 이모지 문자열에 해당하는 버튼의 실제 위치에서 애니메이션 표시
   * 각 이모지가 버튼으로도 사용되므로, 버튼 위치에서 애니메이션이 뜨도록 위치를 개별 추적
   *
   * @param emoji 표시할 이모지 문자열
   */
  const showFloatingFromBar = useCallback(
    (emoji: string) => {
      const el = buttonRefs.current?.get(emoji);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      showFloating(emoji, rect.left + rect.width / 2, rect.top);
    },
    [showFloating],
  );

  /** ref로 showFloatingFromBar 메서드 외부에 노출 */
  useImperativeHandle(ref, () => ({ showFloatingFromBar }), [showFloatingFromBar]);

  /**
   * 이모지 버튼 클릭 핸들러
   * 발송자 화면에 애니메이션을 표시하고 WebSocket으로 브로드캐스트
   *
   * @param emoji 클릭된 이모지
   * @param e 클릭 이벤트
   */
  function handleClick(emoji: string, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    // 내 화면에 이모지 표시
    showFloating(emoji, rect.left + rect.width / 2, rect.top);
    // 이모지 전송
    sendReaction(emoji);
  }

  return (
    <>
      {/* 떠오르는 이모지들 (fixed 포지셔닝) */}
      {floatingEmojis.map((fe) => (
        <div
          key={fe.id}
          style={{
            position: 'fixed',
            left: fe.x,
            top: fe.y,
            fontSize: '20px',
            pointerEvents: 'none',
            animation: 'float-up 0.8s ease-out forwards',
            zIndex: 9999,
          }}
        >
          {fe.emoji}
        </div>
      ))}

      {/* 버튼들 */}
      <div className="flex items-center justify-center gap-3 px-3 py-2 border-t border-border shrink-0">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            ref={(el) => {
              if (el) buttonRefs.current.set(emoji, el);
              else buttonRefs.current.delete(emoji);
            }}
            className="text-[18px] hover:scale-125 transition-transform p-1 rounded-full hover:bg-bg-hover"
            onClick={(e) => handleClick(emoji, e)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
});

export default ReactionBar;
