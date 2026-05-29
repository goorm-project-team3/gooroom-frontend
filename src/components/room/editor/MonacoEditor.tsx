import { useEditorStore } from '@/stores/editorStore';
import { FileNode, useFileTreeStore } from '@/stores/fileTreeStore';
import { Editor } from '@monaco-editor/react';
import { VscVscode } from 'react-icons/vsc';
import * as MonacoType from 'monaco-editor';
import { useRoomStore } from '@/stores/roomStore';
import { useEffect, useRef } from 'react';
import { useFileEditSocket } from '@/hooks/useFileEditSocket';
import { useAwarenessSocket } from '@/hooks/useAwarenessSocket';
import { api } from '@/api/instance';

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
  const role = useRoomStore((s) => s.role);
  const roomId = useRoomStore((s) => s.roomId);

  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null);
  const versionRef = useRef<number>(0);

  const activeFileIdRef = useRef(activeFileId);
  useEffect(() => {
    activeFileIdRef.current = activeFileId;
  }, [activeFileId]);

  const { publishEdit, pendingSyncContentRef, isSyncingRef } = useFileEditSocket(
    activeFileId,
    editorRef,
    versionRef,
  );
  const { publishAwareness } = useAwarenessSocket(activeFileId, editorRef);

  if (!activeFileId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-bg-base text-text-dim select-none">
        <VscVscode size={512} className="opacity-20" />
      </div>
    );
  }

  const node = findNode(files, activeFileId);

  if (activeFileId && node && node.content === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base text-text-dim text-sm">
        Loading...
      </div>
    );
  }

  const content = node?.content ?? '';
  const ext = node?.name.split('.').pop() ?? '';
  const language = LANG_MAP[ext] ?? node?.language ?? 'plaintext';

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        key={activeFileId}
        defaultValue={content}
        height="100%"
        theme="vs-dark"
        language={language}
        onMount={(editor: MonacoType.editor.IStandaloneCodeEditor) => {
          editorRef.current = editor;

          if (pendingSyncContentRef.current !== null) {
            editor.setValue(pendingSyncContentRef.current);
            pendingSyncContentRef.current = null;
          }

          editor.onDidChangeCursorPosition((e) => {
            useEditorStore.getState().setCursorPosition(e.position.lineNumber, e.position.column);
          });

          editor.onDidChangeCursorSelection((e) => {
            const sel = e.selection;
            const isEmptySelection =
              sel.startLineNumber === sel.endLineNumber && sel.startColumn === sel.endColumn;

            publishAwareness(
              { lineNumber: sel.positionLineNumber, column: sel.positionColumn },
              isEmptySelection
                ? null
                : {
                    startLineNumber: sel.startLineNumber,
                    startColumn: sel.startColumn,
                    endLineNumber: sel.endLineNumber,
                    endColumn: sel.endColumn,
                  },
            );
          });

          if (role === 'OWNER') {
            editor.onDidChangeModelContent((e) => {
              if (isSyncingRef.current) return;
              const changes = e.changes.map((change) => ({
                range: {
                  startLineNumber: change.range.startLineNumber,
                  startColumn: change.range.startColumn,
                  endLineNumber: change.range.endLineNumber,
                  endColumn: change.range.endColumn,
                },
                text: change.text,
              }));
              publishEdit(changes);
            });

            editor.addCommand(MonacoType.KeyMod.CtrlCmd | MonacoType.KeyCode.KeyS, () => {
              const fileId = activeFileIdRef.current;
              if (!fileId || !roomId) return;
              api
                .put(`/api/rooms/${roomId}/files/${fileId}`, {
                  content: editor.getValue(),
                })
                .catch(() => {});
            });
          }
        }}
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
          readOnly: role !== 'OWNER',
        }}
      />
    </div>
  );
}
