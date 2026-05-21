import { useEditorStore } from '@/stores/editorStore';
import { useState } from 'react';
import { VscFile, VscSearch } from 'react-icons/vsc';

interface FileResult {
  id: string;
  name: string;
  path: string;
  matches?: {
    line: number;
    text: string;
  }[];
}

const FLAT_FILES: FileResult[] = [
  { id: 'file-1', name: 'main.tsx', path: 'src/main.tsx' },
  { id: 'file-2', name: 'App.tsx', path: 'src/App.tsx' },
  { id: 'file-3', name: 'button.tsx', path: 'src/components/button.tsx' },
  { id: 'file-4', name: 'index.html', path: 'index.html' },
  { id: 'file-5', name: 'package.json', path: 'package.json' },
];

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const { setActiveFile } = useEditorStore();

  const results = query.trim()
    ? FLAT_FILES.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col gap-2 p-2">
      {/* 검색어 입력 */}
      <input
        type="search"
        placeholder="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-bg-input text-text-primary px-2 py-1 h-[24px]"
      />

      {/* 검색 결과 */}
      {query.trim() && (
        <div className="flex flex-col gap-1">
          {results.length > 0 ? (
            results.map((file) => (
              <button
                key={file.id}
                className="flex flex-col items-start w-full gap-2 px-2 py-[5px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors rounded"
                onClick={() => setActiveFile(file.id)}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <VscFile size={14} className="shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="text-[13px] truncate">{file.name}</span>
                    <span className="text-[11px] text-text-dim truncate">{file.path}</span>
                  </div>
                </div>

                {file.matches?.map((match) => (
                  <div key={match.line} className="flex gap-2 pl-5 w-full min-w-0">
                    <span className="text-[11px] text-text-dim shrink-0">{match.line}:</span>
                    <span className="text-[11px] text-text-secondary truncate">{match.text}</span>
                  </div>
                ))}
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-text-dim">
              <VscSearch size={24} />
              <span className="text-[12px]">No results found.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
