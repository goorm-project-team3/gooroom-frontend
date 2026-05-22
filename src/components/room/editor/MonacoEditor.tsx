import { useEditorStore } from '@/stores/editorStore';
import { FileNode, useFileTreeStore } from '@/stores/fileTreeStore';
import { Editor } from '@monaco-editor/react';
import { VscVscode } from 'react-icons/vsc';

const LANG_MAP: Record<string, string> = {
  tsx: 'typescript',
  ts: 'typescript',
  jsx: 'javascript',
  js: 'javascript',
  html: 'html',
  css: 'css',
  json: 'json',
};

function findNode(nodes: FileNode[], targetId: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.children) {
      const found = findNode(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

export default function MonacoEditor() {
  const { activeFileId } = useEditorStore();
  const { files } = useFileTreeStore();

  if (!activeFileId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-bg-base text-text-dim select-none">
        <VscVscode size={512} className="opacity-20" />
      </div>
    );
  }

  const node = findNode(files, activeFileId);
  const content = node?.content ?? '';
  const ext = node?.name.split('.').pop() ?? '';
  const language = LANG_MAP[ext] ?? 'plaintext';

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={content}
        onChange={(value) => {
          if (activeFileId) {
            useFileTreeStore.getState().updateFileContent(activeFileId, value ?? '');
          }
        }}
        options={{
          fontSize: 13,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'monospace'",
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          tabSize: 2,
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
