import ChatInput from '../chat/ChatInput';
import ChatMessages from '../chat/ChatMessages';
import ReactionBar from '../chat/ReactionBar';
import ReactionCard from '../chat/ReactionCard';

export default function RightPanel() {
  return (
    <div className="w-[280px] bg-bg-panel shrink-0 flex flex-col overflow-hidden border-l border-border">
      {/* 헤더 */}
      <div className="px-4 py-2 shrink-0 border-b border-border">
        <span className="text-[11px] font-semibold text-text-dim uppercase tracking-widest">
          CHAT
        </span>
      </div>

      {/* 이해도 반응 */}
      <ReactionCard />

      {/* 채팅 */}
      <ChatMessages />

      {/* 이모지 */}
      <ReactionBar />

      {/* 입력 */}
      <ChatInput />
    </div>
  );
}
