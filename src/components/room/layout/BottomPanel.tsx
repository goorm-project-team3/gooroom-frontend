import { useRoomStore } from '@/stores/roomStore';
import { useRef, useState } from 'react';
import { VscAdd, VscCheck, VscEdit, VscNote, VscTrash } from 'react-icons/vsc';
import ReactMarkdown from 'react-markdown';

interface Note {
  id: string;
  title: string;
  content: string;
  ownerId?: string;
}

type TabType = 'owner' | 'user';
type ViewMode = 'edit' | 'view';

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 620;
const DEFAULT_HEIGHT = 200;

const MOCK_OWNER_NOTES: Note[] = [
  {
    id: 'tn-1',
    title: '1강 핵심 정리',
    content:
      '## TypeScript 기초\n\n- **타입 선언**: 변수에 타입을 명시\n- **인터페이스**: 객체의 구조를 정의\n',
  },
  {
    id: 'tn-2',
    title: '과제 안내',
    content: '## 과제\n\n오늘 배운 내용을 바탕으로 간단한 Todo 앱을 만들어보세요.',
  },
];

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  canEdit: boolean;
  onSelect: () => void;
  onTitleChange: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function NoteItem({ note, isActive, canEdit, onSelect, onTitleChange, onDelete }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.title);

  function handleConfirm() {
    onTitleChange(note.id, draft.trim() || '제목 없음');
    setIsEditing(false);
  }

  return (
    <div
      className={`flex itmes-center gap-1 px-2 py-[5px] rounded cursor-pointer group transition-colors ${
        isActive
          ? 'bg-bg-selected text-text-primary'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
          }}
          className="flex-1 bg-transparent outline-none text-[12px] text-text-primary min-w-0"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 text-[12px] truncate">{note.title}</span>
      )}

      {canEdit && (
        <button
          className={`shrink-0 transition-opacity ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditing) handleConfirm();
            else {
              setDraft(note.title);
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? <VscCheck size={12} className="text-accent-green" /> : <VscEdit size={12} />}
        </button>
      )}
      {canEdit && !isEditing && (
        <button
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
        >
          <VscTrash size={12} className="text-accent-red" />
        </button>
      )}
    </div>
  );
}

export default function BottomPanel() {
  const { role, members } = useRoomStore();
  const me = members[0];

  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [activeTab, setActiveTab] = useState<TabType>('owner');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [ownerNotes, setOwnerNotes] = useState<Note[]>(MOCK_OWNER_NOTES);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(MOCK_OWNER_NOTES[0]?.id ?? null);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const notes = activeTab === 'owner' ? ownerNotes : userNotes.filter((n) => n.ownerId === me?.id);

  const activeNote = notes.find((n) => n.id == activeNoteId) ?? null;

  const canEditContent = activeTab === 'user' || role === 'OWNER';
  const canEditTitle = canEditContent;

  function handleTabChange(tab: TabType) {
    setActiveTab(tab);
    const tabNotes = tab === 'owner' ? ownerNotes : userNotes.filter((n) => n.ownerId === me?.id);
    setActiveNoteId(tabNotes[0]?.id ?? null);
    setViewMode(tab === 'owner' && role === 'USER' ? 'view' : 'edit');
  }

  function handleAddNote() {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '새 노트',
      content: '',
      ownerId: activeTab === 'user' ? me?.id : undefined,
    };
    if (activeTab === 'owner') setOwnerNotes((prev) => [...prev, newNote]);
    else setUserNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
    setViewMode('edit');
  }

  function handleDeleteNote(id: string) {
    const updater = (prev: Note[]) => prev.filter((n) => n.id !== id);
    if (activeTab === 'owner') setOwnerNotes(updater);
    else setUserNotes(updater);

    if (activeNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setActiveNoteId(remaining[0]?.id ?? null);
    }
  }

  function handleTitleChange(id: string, title: string) {
    const updater = (prev: Note[]) => prev.map((n) => (n.id === id ? { ...n, title } : n));
    if (activeTab === 'owner') setOwnerNotes(updater);
    else setUserNotes(updater);
  }

  function handleContentChange(content: string) {
    if (!activeNoteId) return;
    const updater = (prev: Note[]) =>
      prev.map((n) => (n.id === activeNoteId ? { ...n, content } : n));
    if (activeTab === 'owner') setOwnerNotes(updater);
    else setUserNotes(updater);
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

      <div className="flex flex-1 overflow-hidden">
        {/* 노트 목록 (좌측) */}
        <div className="w-[160px] shrink-0 border-r border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-1 flex flex-col gap-[2px]">
            {notes.length === 0 ? (
              <span className="text-[11px] text-text-dim px-2 py-2">노트가 없습니다</span>
            ) : (
              notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={activeNoteId === note.id}
                  canEdit={canEditTitle}
                  onSelect={() => setActiveNoteId(note.id)}
                  onTitleChange={handleTitleChange}
                  onDelete={handleDeleteNote}
                />
              ))
            )}
          </div>

          {canEditContent && (
            <button
              className="flex items-center gap-1 px-2 py-2 text-[12px] text-text-dim hover:text-text-primary hover:bg-bg-hover transition-colors border-t border-border shrink-0"
              onClick={handleAddNote}
            >
              <VscAdd size={12} /> 새 노트
            </button>
          )}
        </div>

        {/* 노트 편집/미리보기 (우측) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeNote ? (
            <>
              {/* 편집/미리보기 탭 */}
              {canEditContent && (
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

              {/* 내용 영역 */}
              <div className="flex-1 overflow-hidden">
                {viewMode === 'edit' && canEditContent ? (
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full bg-transparent text-text-primary text-[13px] placeholder:text-text-dim px-4 py-3 resize-none outline-none"
                    placeholder="마크다운으로 작성하세요..."
                  />
                ) : (
                  <div className="h-full overflow-y-auto px-4 py-3 prose prose-invert prose-sm max-w-none text-text-secondary text-[13px]">
                    {activeNote.content ? (
                      <ReactMarkdown>{activeNote.content}</ReactMarkdown>
                    ) : (
                      <span className="text-text-dim">내용이 없습니다.</span>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-dim text-[12px]">
              노트를 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
