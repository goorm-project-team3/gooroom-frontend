import { useEditorStore } from '@/stores/editorStore';
import { Editor } from '@monaco-editor/react';
import { VscVscode } from 'react-icons/vsc';

const MOCK_CONTENTS: Record<string, string> = {
  'file-1': `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from
  './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n
  </React.StrictMode>\n);`,
  'file-2': `export default function App() {\n  return <div>Hello, GooRoom!</div>;\n}`,
  'file-3': `interface ButtonProps {\n  label: string;\n  onClick: () => void;\n}\n\nexport default function Button({
  label, onClick }: ButtonProps) {\n  return <button onClick={onClick}>{label}</button>;\n}`,
  'file-4': `<!DOCTYPE html>\n<html lang="ko">\n  <head>\n    <meta charset="UTF-8" />\n    <title>GooRoom</title>\n
  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
  'file-5': `{\n  "name": "gooroom",\n  "version": "1.0.0"\n}`,
};

const FILE_NAMES: Record<string, string> = {
  'file-1': 'main.tsx',
  'file-2': 'App.tsx',
  'file-3': 'button.tsx',
  'file-4': 'index.html',
  'file-5': 'package.json',
};

const LANG_MAP: Record<string, string> = {
  tsx: 'typescript',
  ts: 'typescript',
  jsx: 'javascript',
  js: 'javascript',
  html: 'html',
  css: 'css',
  json: 'json',
};

const getLanguage = (fileId: string): string => {
  const name = FILE_NAMES[fileId] ?? '';
  const ext = name.split('.').pop() ?? '';
  return LANG_MAP[ext] ?? 'plaintext';
};

export default function MonacoEditor() {
  const { activeFileId } = useEditorStore();

  if (!activeFileId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-bg-base text-text-dim select-none">
        <VscVscode size={512} className="opacity-20" />
      </div>
    );
  }

  const content = activeFileId ? (MOCK_CONTENTS[activeFileId] ?? '') : '';
  const language = activeFileId ? getLanguage(activeFileId) : 'plaintext';

  return (
    <div className="flex-1 overflow-hidden">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={content}
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
