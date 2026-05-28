import { useEditorStore } from '@/stores/editorStore';
import { useFileTreeStore, type FileNode } from '@/stores/fileTreeStore';
import { useRoomStore } from '@/stores/roomStore';
import { Collapsible, Text } from '@vapor-ui/core';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '@/api/instance';
import {
  VscChevronDown,
  VscChevronRight,
  VscFile,
  VscNewFile,
  VscFolder,
  VscNewFolder,
  VscFolderOpened,
  VscTrash,
  VscCloudUpload,
  VscFileSubmodule,
} from 'react-icons/vsc';

// --- Drag Context ---
interface DragCtx {
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
}
const DragContext = createContext<DragCtx>({ draggingId: null, setDraggingId: () => {} });

interface CtxMenuCtxValue {
  openCtxMenu: (e: React.MouseEvent, nodeId: string, nodeType: 'file' | 'folder') => void;
}
const CtxmenuContext = createContext<CtxMenuCtxValue>({ openCtxMenu: () => {} });

interface PendingAddCtxValue {
  pendingAdd: { parentId: string; type: 'file' | 'folder' } | null;
  clearPendingAdd: () => void;
}
const PendingAddCtx = createContext<PendingAddCtxValue>({
  pendingAdd: null,
  clearPendingAdd: () => {},
});

type AddingType = 'file' | 'folder' | null;

function shouldSkipPath(relativePath: string): boolean {
  return relativePath
    .split('/')
    .some((part) => ['node_modules', '.git', 'dist', 'build', '.next', 'out'].includes(part));
}

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
  const [localOpen, setLocalOpen] = useState(true);
  const [localAdding, setLocalAdding] = useState<AddingType>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { addNode, moveNode } = useFileTreeStore();
  const { draggingId, setDraggingId } = useContext(DragContext);
  const { openCtxMenu } = useContext(CtxmenuContext);
  const { pendingAdd, clearPendingAdd } = useContext(PendingAddCtx);

  const paddingLeft = depth * 12 + 8;

  const isTargeted = pendingAdd?.parentId === node.id;
  const open = isTargeted ? true : localOpen;
  const adding: AddingType = isTargeted ? pendingAdd!.type : localAdding;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (draggingId && draggingId !== node.id) {
      moveNode(draggingId, node.id);
      setDraggingId(null);
      setLocalOpen(true);
    }
  };

  return (
    // 드롭 타겟: 폴더 전체 영역
    <div
      onContextMenu={(e) => openCtxMenu(e, node.id, 'folder')}
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
      <Collapsible.Root open={open} onOpenChange={setLocalOpen}>
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
                setLocalAdding(null);
                if (isTargeted) clearPendingAdd();
              }}
              onCancel={() => {
                setLocalAdding(null);
                if (isTargeted) clearPendingAdd();
              }}
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
  const { openCtxMenu } = useContext(CtxmenuContext);
  const isActive = activeFileId === node.id;

  const roomId = useRoomStore((s) => s.roomId);
  const { updateFileContent } = useFileTreeStore();

  const handleClick = async () => {
    setActiveFile(node.id);

    if (node.content === undefined) return;

    try {
      const res = await api.get(`/api/rooms/${roomId}/files/${node.id}`);
      updateFileContent(node.id, res.data.content ?? '');
    } catch (e) {
      console.error('파일 내용 불러오기 실패', e);
      updateFileContent(node.id, '');
    }
  };

  if (node.type === 'folder') return <FolderNodeItem node={node} depth={depth} />;

  return (
    <button
      onContextMenu={(e) => openCtxMenu(e, node.id, 'file')}
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
      onClick={handleClick}
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
  const { files, addNode, moveNode, removeNode, getDescendantFileIds } = useFileTreeStore();
  const { closeFile } = useEditorStore();
  const [adding, setAdding] = useState<AddingType>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [isRootDragOver, setIsRootDragOver] = useState(false);
  const roomName = useRoomStore((s) => s.roomName);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTargetId, setImportTargetId] = useState<string | null>(undefined!);

  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    folderInputRef.current?.setAttribute('webkitdirectory', '');
  }, []);

  const handleImportClick = (parentId: string | null) => {
    setImportTargetId(parentId);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        addNode(importTargetId, file.name, 'file', content);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  const handleFolderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []).filter(
      (file) => !shouldSkipPath(file.webkitRelativePath),
    );
    if (selectedFiles.length === 0) return;

    const pathToId = new Map<string, string>();

    const dirPaths = new Set<string>();

    for (const file of selectedFiles) {
      const parts = file.webkitRelativePath.split('/');
      for (let i = 1; i < parts.length; i++) {
        dirPaths.add(parts.slice(0, i).join('/'));
      }
    }

    const sortedDirPaths = Array.from(dirPaths).sort(
      (a, b) => a.split('/').length - b.split('/').length,
    );

    for (const dirPath of sortedDirPaths) {
      const parts = dirPath.split('/');
      const name = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      const parentId = parentPath ? (pathToId.get(parentPath) ?? null) : null;
      const newId = addNode(parentId, name, 'folder');
      pathToId.set(dirPath, newId);
    }

    for (const file of selectedFiles) {
      const parts = file.webkitRelativePath.split('/');
      const parentPath = parts.slice(0, -1).join('/');
      const parentId = pathToId.get(parentPath) ?? null;

      const reader = new FileReader();
      reader.onload = (event) => {
        addNode(parentId, file.name, 'file', event.target?.result as string);
      };
      reader.onerror = () => {
        addNode(parentId, file.name, 'file', '');
      };
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  // 컨텍스트 메뉴 state
  const [ctxMenu, setCtxMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    targetId: string | null;
    targetType: 'file' | 'folder' | 'root';
  } | null>(null);

  // 특정 폴더에 인라인 input 열기 신호
  const [pendingAdd, setPendingAdd] = useState<{
    parentId: string;
    type: 'file' | 'folder';
  } | null>(null);

  const openCtxMenu = (e: React.MouseEvent, nodeId: string, nodeType: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ open: true, x: e.clientX, y: e.clientY, targetId: nodeId, targetType: nodeType });
  };

  const handleCtxNewFile = () => {
    if (ctxMenu?.targetType === 'folder' && ctxMenu.targetId) {
      setPendingAdd({ parentId: ctxMenu.targetId, type: 'file' });
    } else {
      setAdding('file');
      setOpen(true);
    }
    setCtxMenu(null);
  };

  const handleCtxNewFolder = () => {
    if (ctxMenu?.targetType === 'folder' && ctxMenu.targetId) {
      setPendingAdd({ parentId: ctxMenu.targetId, type: 'folder' });
    } else {
      setAdding('folder');
      setOpen(true);
    }
    setCtxMenu(null);
  };

  const handleCtxDelete = () => {
    if (!ctxMenu?.targetId) return;
    if (ctxMenu.targetType === 'file') {
      closeFile(ctxMenu.targetId);
    } else {
      getDescendantFileIds(ctxMenu.targetId).forEach(closeFile);
    }
    removeNode(ctxMenu.targetId);
    setCtxMenu(null);
  };

  return (
    <DragContext.Provider value={{ draggingId, setDraggingId }}>
      <CtxmenuContext.Provider value={{ openCtxMenu }}>
        <PendingAddCtx.Provider value={{ pendingAdd, clearPendingAdd: () => setPendingAdd(null) }}>
          <div
            className={`flex flex-col h-full ${isRootDragOver ? 'bg-bg-hover/20' : ''}`}
            onContextMenu={(e) => {
              e.preventDefault();
              setCtxMenu({
                open: true,
                x: e.clientX,
                y: e.clientY,
                targetId: null,
                targetType: 'root',
              });
            }}
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
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
            />
            <input
              ref={folderInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFolderInputChange}
            />
            <Collapsible.Root open={open} onOpenChange={setOpen} className="flex flex-col">
              <div
                className="flex items-center"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <Collapsible.Trigger className="w-full flex items-center gap-1 py-[3px] hover:bg-bg-input text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
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
                    onClick={() => handleImportClick(null)}
                    className="p-0.5 rounded hover:bg-bg-selected text-text-secondary hover:text-text-primary"
                    title="File Import"
                  >
                    <VscCloudUpload size={14} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => folderInputRef.current?.click()}
                    className="p-0.5 rounded hover:bg-bg-selected text-text-secondary hover:text-text-primary"
                    title="Folder Import"
                  >
                    <VscFileSubmodule size={14} />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setAdding('file');
                      setOpen(true);
                    }}
                    className="p-0.5 rounded hover:bg-bg-selected text-text-secondary hover:text-text-primary"
                    title="New File"
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
                    title="New Folder"
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

            {/* 컨텍스트 메뉴 */}
            {ctxMenu?.open && (
              <ContextMenu
                x={ctxMenu.x}
                y={ctxMenu.y}
                targetType={ctxMenu.targetType}
                onNewFile={handleCtxNewFile}
                onNewFolder={handleCtxNewFolder}
                onDelete={handleCtxDelete}
                onClose={() => setCtxMenu(null)}
              />
            )}
          </div>
        </PendingAddCtx.Provider>
      </CtxmenuContext.Provider>
    </DragContext.Provider>
  );
}

interface ContextMenuProps {
  x: number;
  y: number;
  targetType: 'file' | 'folder' | 'root';
  onNewFile: () => void;
  onNewFolder: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function ContextMenu({
  x,
  y,
  targetType,
  onNewFile,
  onNewFolder,
  onDelete,
  onClose,
}: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleContextMenu = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const left = Math.min(x, window.innerWidth - 160);
  const top = Math.min(y, window.innerHeight - 150);

  const itemCls =
    'w-full flex items-center gap-2 px-3 py-[5px] text-[13px] text-text-secondary hover:bg-bg-hover hover:text-text-primary cursor-pointer transition-colors text-left';

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left, top, zIndex: 9999 }}
      className="bg-bg-panel border border-border rounded shadow-lg py-1 min-w-[150px]"
      onContextMenu={(e) => e.preventDefault()}
    >
      {(targetType === 'folder' || targetType === 'root') && (
        <>
          <button className={itemCls} onClick={onNewFile}>
            <VscNewFile size={14} /> New File
          </button>
          <button className={itemCls} onClick={onNewFolder}>
            <VscNewFolder size={14} /> New Folder
          </button>
        </>
      )}
      {targetType !== 'root' && (
        <>
          {targetType === 'folder' && <div className="mx-2 my-1 border-t border-border" />}
          <button className={`${itemCls} !text-red-400 hover:!text-red-300`} onClick={onDelete}>
            <VscTrash size={14} /> Delete
          </button>
        </>
      )}
    </div>
  );
}
