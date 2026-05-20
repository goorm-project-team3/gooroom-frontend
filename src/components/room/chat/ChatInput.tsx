import { useState } from 'react';
import { IconButton } from '@vapor-ui/core';
import { VscSend } from 'react-icons/vsc';
import { useChatStore } from '@/stores/chatStore';
import { useRoomStore } from '@/stores/roomStore';

export default function ChatInput() {
  const [value, setValue] = useState('');

  const { addMessage } = useChatStore();
  const { members } = useRoomStore();

  const me = members[0]; // 임시로 첫 번째 멤버를 나로 간주

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (!value.trim() || !me) return;
    // 추후 실제 전송 로직 연결
    addMessage(value.trim(), me.id, me.name);
    setValue('');
  }

  return (
    <div className="flex items-stretch gap-2 p-3 border-t border-border shrink-0">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        rows={1}
        className="flex-1 bg-bg-input text-text-primary text-[13px] placeholder:text-text-dim rounded px-3 py-2 resize-none outline-none border border-border focus:border-[#007acc] transition-colors"
        style={{ maxHeight: '120px', overflowY: 'auto' }}
      />
      <IconButton
        variant="fill"
        colorPalette="primary"
        shape="square"
        onClick={handleSend}
        disabled={!value.trim()}
        className="!h-[38px] !w-[38px] shrink-0"
      >
        <VscSend size={14} />
      </IconButton>
    </div>
  );
}
