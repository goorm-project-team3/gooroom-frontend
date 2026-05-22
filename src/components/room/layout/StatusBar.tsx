import { useEditorStore } from '@/stores/editorStore';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { useFocusStore } from '@/stores/focusStore';
import { useRoomStore } from '@/stores/roomStore';
import { VscCircleFilled } from 'react-icons/vsc';

const LANG_LABEL: Record<string, string> = {
  tsx: 'TypeScript JSX',
  ts: 'TypeScript',
  jsx: 'JavaScript JSX',
  js: 'JavaScript',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
};

export default function StatusBar() {
  const { role } = useRoomStore();
  const { isFocusMode } = useFocusStore();
  const { activeFileId } = useEditorStore();
  const { files } = useFileTreeStore();

  function getLanguageLabel(): string {
    if (!activeFileId) return 'text';
    function findName(nodes: typeof files): string | null {
      for (const node of nodes) {
        if (node.id === activeFileId) return node.name;
        if (node.children) {
          const found = findName(node.children);
          if (found) return found;
        }
      }
      return null;
    }
    const name = findName(files) ?? '';
    const ext = name.split('.').pop() ?? '';
    return LANG_LABEL[ext] ?? 'text';
  }

  return (
    <div className="h-[28px] bg-bg-base shrink-0 flex items-center justify-between px-3 border-t border-border">
      <div className="flex items-center gap-3">
        {/* WS Connection Status */}
        <div className="flex items-center gap-1">
          <VscCircleFilled size={10} className="text-accent-green" />
          <span className="text-[11px] text-white">WS Connected</span>
        </div>

        {/* Role */}
        <span className="text-[11px] text-white opacity-80">
          {role === 'OWNER' ? '강사' : '학생'}
        </span>

        {/* Focus Mode */}
        {role === 'USER' && isFocusMode && (
          <span className="text-[11px] text-accent-orange opacity-80">FOCUS MODE</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Language */}
        <span className="text-[11px] text-white opacity-80">{getLanguageLabel()}</span>

        {/* Encoding */}
        <span className="text-[11px] text-white opacity-80">UTF-8</span>

        {/* Cursor Position */}
        <span className="text-[11px] text-white opacity-80">Ln 1, Col 1</span>
      </div>
    </div>
  );
}
