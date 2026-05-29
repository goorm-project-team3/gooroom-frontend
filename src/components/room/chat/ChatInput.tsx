import { useState } from 'react';
import { IconButton } from '@vapor-ui/core';
import { VscSend } from 'react-icons/vsc';
import { useChatStore } from '@/stores/chatStore';

interface ChatInputProps {
  onSend: (content: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState('');
  const isConnected = useChatStore((s) => s.isConnected);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    if (!value.trim() || !isConnected) return;
    onSend(value.trim());
    setValue('');
  }

  return (
    <div className="flex items-stretch gap-2 p-3 border-t border-border shrink-0">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isConnected ? '메시지를 입력하세요...' : '연결 중...'}
        disabled={!isConnected}
        rows={1}
        className="flex-1 bg-bg-input text-text-primary text-[13px] placeholder:text-text-dim rounded px-3 py-2 resize-none outline-none border border-border focus:border-[#007acc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ maxHeight: '120px', overflowY: 'auto' }}
      />
      <IconButton
        variant="fill"
        colorPalette="primary"
        shape="square"
        onClick={handleSend}
        disabled={!value.trim() || !isConnected}
        className="!h-[38px] !w-[38px] shrink-0"
      >
        <VscSend size={14} />
      </IconButton>
    </div>
  );
}
