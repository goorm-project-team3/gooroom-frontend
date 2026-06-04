import { useEditorStore } from '@/stores/editorStore';
import { useFileTreeStore } from '@/stores/fileTreeStore';
import { useMemo, useState } from 'react';
import { VscFile, VscSearch, VscChevronRight } from 'react-icons/vsc';
import type { FileNode } from '@/stores/fileTreeStore';

function flattenFilesWithPaths(nodes: FileNode[], prefix = ''): (FileNode & { path: string })[] {
  return nodes.flatMap((node) => {
    const currentPath = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.type === 'file') return [{ ...node, path: currentPath }];
    return flattenFilesWithPaths(node.children ?? [], currentPath);
  });
}

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const { setActiveFile } = useEditorStore();
  const files = useFileTreeStore((s) => s.files);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return flattenFilesWithPaths(files)
      .filter((f) => f.name.toLowerCase().includes(q) || f.content?.toLowerCase().includes(q))
      .map((f) => {
        const matches =
          f.content
            ?.split('\n')
            .map((text, i) => ({ line: i + 1, text }))
            .filter(({ text }) => text.toLowerCase().includes(q)) ?? [];

        return { ...f, matches };
      });
  }, [query, files]);

  const toggleCollapse = (fileId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

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
            results.map((file) => {
              const isCollapsed = collapsed.has(file.id);
              return (
                <div key={file.id} className="flex flex-col">
                  {/* 파일 헤더 — 클릭 시 토글 */}
                  <div
                    className="flex items-center gap-1 px-2 py-[5px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors rounded
  cursor-pointer"
                    onClick={() => toggleCollapse(file.id)}
                  >
                    <VscChevronRight
                      size={12}
                      className={`shrink-0 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                    />
                    <VscFile size={14} className="shrink-0" />
                    <div
                      className="flex flex-col min-w-0 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFile(file.id);
                      }}
                    >
                      <span className="text-[13px] truncate">{file.name}</span>
                      <span className="text-[11px] text-text-dim truncate">{file.path}</span>
                    </div>
                  </div>

                  {/* 매칭 라인 — 펼쳐진 경우만 표시 */}
                  {!isCollapsed &&
                    file.matches.map((match) => (
                      <div
                        key={match.line}
                        className="flex gap-2 pl-8 pr-2 py-[2px] hover:bg-bg-hover cursor-pointer rounded"
                        onClick={() => setActiveFile(file.id)}
                      >
                        <span className="text-[11px] text-text-dim shrink-0">{match.line}:</span>
                        <span className="text-[11px] text-text-secondary truncate">
                          {match.text}
                        </span>
                      </div>
                    ))}
                </div>
              );
            })
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
