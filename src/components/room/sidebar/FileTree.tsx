import { useEditorStore } from '@/stores/editorStore';
import { useFileTreeStore, type FileNode } from '@/stores/fileTreeStore';
import { useRoomStore } from '@/stores/roomStore';
import { Collapsible, Text } from '@vapor-ui/core';
import { createContext, useContext, useState } from 'react';
import {
  VscChevronDown,
  VscChevronRight,
  VscFile,
  VscNewFile,
  VscFolder,
  VscNewFolder,
  VscFolderOpened,
} from 'react-icons/vsc';

// --- Drag Context ---
interface DragCtx {
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
}
const DragContext = createContext<DragCtx>({ draggingId: null, setDraggingId: () => {} });

type AddingType = 'file' | 'folder' | null;

// --- InlineInput ---
function InlineInput({
  depth,
  icon,
  onConfirm,
  onCancel,
}: {
  depth: number;
  icon: React.ReactNode;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState('');
  return (
    <div
      className="flex items-center gap-1 py-[3px] pr-2"
      style={{ paddingLeft: depth * 12 + 8 + 18 }}
    >
      {icon}
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) onConfirm(value.trim());
          else if (e.key === 'Escape') onCancel();
        }}
        onBlur={onCancel}
        className="flex-1 bg-transparent border border-border-focus text-text-primary text-xs px-1 py-[1px] outline-none rounded-sm"
      />
    </div>
  );
}

// --- Folder Node ---
function FolderNodeItem({ node, depth }: { node: FileNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState<AddingType>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { addNode, moveNode } = useFileTreeStore();
  const { draggingId, setDraggingId } = useContext(DragContext);
  const paddingLeft = depth * 12 + 8;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (draggingId && draggingId !== node.id) {
      moveNode(draggingId, node.id);
      setDraggingId(null);
      setOpen(true);
    }
  };

  return (
    // 드롭 타겟: 폴더 전체 영역
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggingId !== node.id) setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
      }}
      onDrop={handleDrop}
      className={`${isDragOver ? 'outline outline-1 outline-border-focus rounded' : ''} ${draggingId === node.id ? 'opacity-50' : ''}`}
    >
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        {/* 드래그 소스: 폴더 헤더 */}
        <Collapsible.Trigger
          draggable
          onDragStart={(e: React.DragEvent) => {
            e.stopPropagation();
            setDraggingId(node.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => setDraggingId(null)}
          className="w-full flex items-center gap-1 py-[3px] hover:bg-bg-input text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          style={{ paddingLeft }}
        >
          {open ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
          {open ? (
            <VscFolderOpened size={14} className="text-[#e8ab70]" />
          ) : (
            <VscFolder size={14} className="text-[#e8ab70]" />
          )}
          <Text typography="body3" className="ml-1 text-text-secondary text-left flex-1">
            {node.name}
          </Text>
        </Collapsible.Trigger>
        <Collapsible.Panel>
          {node.children?.map((child) => (
            <FileNodeItem key={child.id} node={child} depth={depth + 1} />
          ))}
          {adding && (
            <InlineInput
              depth={depth + 1}
              icon={
                adding === 'file' ? (
                  <VscFile size={14} />
                ) : (
                  <VscFolder size={14} className="text-[#e8ab70]" />
                )
              }
              onConfirm={(name) => {
                addNode(node.id, name, adding);
                setAdding(null);
              }}
              onCancel={() => setAdding(null)}
            />
          )}
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

// --- File Node ---
function FileNodeItem({ node, depth }: { node: FileNode; depth: number }) {
  const { activeFileId, setActiveFile } = useEditorStore();
  const { draggingId, setDraggingId } = useContext(DragContext);
  const isActive = activeFileId === node.id;

  if (node.type === 'folder') return <FolderNodeItem node={node} depth={depth} />;

  return (
    <button
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        setDraggingId(node.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setDraggingId(null)}
      className={`w-full flex items-center gap-1 py-[3px] transition-colors cursor-pointer ${
        isActive
          ? 'bg-bg-selected text-text-primary'
          : 'text-text-secondary hover:bg-bg-input hover:text-text-primary'
      } ${draggingId === node.id ? 'opacity-50' : ''}`}
      style={{ paddingLeft: depth * 12 + 8 + 18 }}
      onClick={() => setActiveFile(node.id)}
    >
      <VscFile size={14} />
      <Text typography="body3" className="ml-1 text-text-secondary">
        {node.name}
      </Text>
    </button>
  );
}

// --- Main ---
export default function FileTree() {
  const { files, addNode, moveNode } = useFileTreeStore();

  const [adding, setAdding] = useState<AddingType>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [isRootDragOver, setIsRootDragOver] = useState(false);

  const roomName = useRoomStore((s) => s.roomName);

  return (
    <DragContext.Provider value={{ draggingId, setDraggingId }}>
      {/* h-full → 빈 공간까지 전부 드롭존 */}
      <div
        className={`flex flex-col h-full ${isRootDragOver ? 'bg-bg-hover/20' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsRootDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsRootDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (draggingId) {
            moveNode(draggingId, null);
            setDraggingId(null);
          }
          setIsRootDragOver(false);
        }}
      >
        <Collapsible.Root open={open} onOpenChange={setOpen} className="flex flex-col">
          {/* 루트 헤더 - drag 핸들러 제거 (외부 div가 처리) */}
          <div
            className="flex items-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Collapsible.Trigger className="flex-1 flex items-center gap-1 px-2 py-[5px] select-none hover:bg-bg-hover cursor-pointer">
              {open ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
              <Text
                typography="body3"
                className="ml-1 text-text-secondary text-[11px] font-semibold uppercase tracking-wider"
              >
                {roomName ?? '강의룸'}
              </Text>
            </Collapsible.Trigger>
            <div
              className={`flex gap-0.5 pr-2 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}
            >
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setAdding('file');
                  setOpen(true);
                }}
                className="p-0.5 rounded hover:bg-bg-selected text-text-secondary hover:text-text-primary"
                title="새 파일"
              >
                <VscNewFile size={14} />
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setAdding('folder');
                  setOpen(true);
                }}
                className="p-0.5 rounded hover:bg-bg-selected text-text-secondary hover:text-text-primary"
                title="새 폴더"
              >
                <VscNewFolder size={14} />
              </button>
            </div>
          </div>

          <Collapsible.Panel>
            <div className="flex flex-col py-1">
              {files.map((node) => (
                <FileNodeItem key={node.id} node={node} depth={0} />
              ))}
              {adding && (
                <InlineInput
                  depth={0}
                  icon={
                    adding === 'file' ? (
                      <VscFile size={14} />
                    ) : (
                      <VscFolder size={14} className="text-[#e8ab70]" />
                    )
                  }
                  onConfirm={(name) => {
                    addNode(null, name, adding);
                    setAdding(null);
                  }}
                  onCancel={() => setAdding(null)}
                />
              )}
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>
    </DragContext.Provider>
  );
}
