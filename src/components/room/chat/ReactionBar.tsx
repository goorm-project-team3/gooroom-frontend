import { useState } from 'react';

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const EMOJIS = ['👍', '❤️', '👏'];

export default function ReactionBar() {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  function handleClick(emoji: string, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();

    setFloatingEmojis((prev) => [
      ...prev,
      {
        id,
        emoji,
        x: rect.left + rect.width / 2,
        y: rect.top,
      },
    ]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((fe) => fe.id !== id));
    }, 800);
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
            className="text-[18px] hover:scale-125 transition-transform p-1 rounded-full hover:bg-bg-hover"
            onClick={(e) => handleClick(emoji, e)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
