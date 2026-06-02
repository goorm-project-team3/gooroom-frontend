import { usePersonalNote } from '@/hooks/usePersonalNote';
import { useSharedNote } from '@/hooks/useSharedNote';
import { useRoomStore } from '@/stores/roomStore';
import { useEffect, useRef, useState } from 'react';
import { VscRefresh } from 'react-icons/vsc';
import ReactMarkdown from 'react-markdown';

type TabType = 'owner' | 'user';
type ViewMode = 'edit' | 'preview';

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 620;
const DEFAULT_HEIGHT = 200;

export default function BottomPanel() {
  const { role } = useRoomStore();

  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [activeTab, setActiveTab] = useState<TabType>('owner');
  const [viewMode, setViewMode] = useState<ViewMode>(role === 'OWNER' ? 'edit' : 'preview');

  const sharedNote = useSharedNote();
  const personalNote = usePersonalNote();

  const [draftContent, setDraftContent] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canEdit = activeTab === 'user' || role === 'OWNER';
  const isLoading =
    (activeTab === 'owner' && sharedNote.isLoading) ||
    (activeTab === 'user' && personalNote.isLoading);

  const currenntApiContent =
    activeTab === 'owner' ? (sharedNote.data?.content ?? '') : (personalNote.data?.content ?? '');

  const displayContent = draftContent ?? currenntApiContent;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    setDraftContent(null);
    setViewMode(tab === 'owner' && role === 'USER' ? 'preview' : 'edit');
  }

  function handleContentChange(content: string) {
    setDraftContent(content);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (activeTab === 'owner' && role === 'OWNER') sharedNote.save(content);
      else if (activeTab === 'user') personalNote.save(content);
    }, 1000);
  }

  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging.current) return;
    const delta = startY.current - e.clientY;
    const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
    setHeight(newHeight);
  }

  function handleMouseUp() {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  return (
    <div className="bg-bg-panel shrink-0 flex flex-col border-t border-border" style={{ height }}>
      <div
        className="h-[4px] cursor-row-resize hover:bg-[#007acc] transition-colors shrink-0"
        onMouseDown={handleMouseDown}
      />

      {/* 탭 바 */}
      <div className="flex items-end border-b border-border shrink-0 bg-bg-panel overflow-x-auto overflow-y-clip">
        <div className="flex items-end">
          {(['owner', 'user'] as TabType[]).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1 text-[12px] shrink-0 transition-colors border-t-2 ${
                activeTab === tab
                  ? 'border-t-[#007acc] text-text-primary bg-bg-base'
                  : 'border-t-transparent text-text-dim hover:text-text-secondary'
              }`}
              onClick={() => handleTabChange(tab)}
            >
              {tab === 'owner' ? '강사 노트' : '개인 노트'}
            </button>
          ))}
        </div>

        {activeTab === 'owner' && (
          <button
            className="px-2 py-1 text-text-dim hover:text-text-primary disabled:opacity-40 transition-colors"
            onClick={() => {
              setDraftContent(null);
              sharedNote.refetch();
            }}
            disabled={sharedNote.isFetching}
            title="새로고침"
          >
            <VscRefresh size={13} className={sharedNote.isFetching ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 노트 목록 (좌측) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-dim text-[12px]">
              불러오는 중...
            </div>
          ) : (
            <>
              {canEdit && (
                <div className="flex gap-2 px-3 py-1 border-b border-border shrink-0">
                  {(['edit', 'preview'] as ViewMode[]).map((m) => (
                    <button
                      key={m}
                      className={`text-[11px] px-2 py-[2px] rounded transition-colors ${
                        viewMode === m
                          ? 'bg-bg-selected text-text-primary'
                          : 'text-text-dim hover:text-text-secondary'
                      }`}
                      onClick={() => setViewMode(m)}
                    >
                      {m === 'edit' ? '편집' : '미리보기'}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                {viewMode === 'edit' && canEdit ? (
                  <textarea
                    value={displayContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full bg-transparent text-text-primary text-[13px] placeholder:text-text-dim px-4 py-3 resize-none outline-none"
                    placeholder="마크다운으로 작성하세요..."
                  />
                ) : (
                  <div className="h-full overflow-y-auto px-4 py-3 prose prose-invert prose-sm max-w-none text-text-secondary text-[13px]">
                    {displayContent ? (
                      <ReactMarkdown>{displayContent}</ReactMarkdown>
                    ) : (
                      <span className="text-text-dim">내용이 없습니다.</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
