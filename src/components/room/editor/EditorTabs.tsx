import { useEditorStore } from '@/stores/editorStore';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { VscClose, VscFile } from 'react-icons/vsc';

const getFileIconColor = (name: string): string => {
  const ext = name.split('.').pop();

  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'text-[#3178c6]';
    case 'jsx':
    case 'js':
      return 'text-[#f7df1e]';
    case 'html':
      return 'text-[#e44d26]';
    case 'json':
      return 'text-[#f5a623]';
    case 'css':
      return 'text-[#264de4]';
    default:
      return 'text-text-dim';
  }
};

export default function EditorTabs() {
  const { openedFiles, activeFileId, setActiveFile, closeFile } = useEditorStore();
  const { files } = useFileTreeStore();

  const getFileName = (fileId: string): string => {
    function findName(nodes: typeof files): string | null {
      for (const node of nodes) {
        if (node.id === fileId) return node.name;
        if (node.children) {
          const found = findName(node.children);
          if (found) return found;
        }
      }
      return null;
    }
    return findName(files) ?? fileId;
  };

  if (openedFiles.length === 0) {
    return <div className="h-[35px] bg-bg-panel border-b border-border shrink-0" />;
  }

  return (
    <div className="h-[35px] flex items-end bg-bg-panel border-b border-border shrink-0 overflow-x-auto overflow-y-clip">
      {openedFiles.map((fileId) => {
        const name = getFileName(fileId);
        const isActive = activeFileId === fileId;

        return (
          <div
            key={fileId}
            className={`flex items-center gap-1 px-3 h-full shrink-0 cursor-pointer border-r border-border group transition-colors ${
              isActive
                ? 'bg-bg-base border-t-2 border-t-[#007acc] border-b border-b-bg-base mb-[-1px] text-text-primary'
                : 'bg-bg-panel text-text-dim hover:text-text-secondary'
            }`}
            onClick={() => setActiveFile(fileId)}
          >
            <VscFile size={13} className={getFileIconColor(name)} />
            <span className="text-[13px]">{name}</span>
            <button
              className={`ml-1 rounded p-[1px] hover:bg-bg-hover transition-opacity ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                closeFile(fileId);
              }}
            >
              <VscClose size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
