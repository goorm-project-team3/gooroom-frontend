import { useEditorStore } from '@/stores/editorStore';
import { Breadcrumb } from '@vapor-ui/core';
import { VscChevronRight } from 'react-icons/vsc';
import { Fragment } from 'react';
import { FileNode, useFileTreeStore } from '@/stores/fileTreeStore';

function getPath(nodes: FileNode[], targetId: string, path: string[] = []): string[] | null {
  for (const node of nodes) {
    const cur = [...path, node.name];
    if (node.id === targetId) return cur;
    if (node.children) {
      const found = getPath(node.children, targetId, cur);
      if (found) return found;
    }
  }
  return null;
}

export default function EditorBreadcrumb() {
  const { activeFileId } = useEditorStore();
  const { files } = useFileTreeStore();

  if (!activeFileId) {
    return <div className="h-[24px] bg-bg-base border-b border-border shrink-0" />;
  }

  const segments = getPath(files, activeFileId) ?? [activeFileId];

  return (
    <div className="h-[24px] flex items-center px-3 bg-bg-base border-b border-border shrink-0 overflow-hidden">
      <Breadcrumb.Root size="sm" className="flex items-center">
        <Breadcrumb.ListPrimitive>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            return (
              <Fragment key={index}>
                <Breadcrumb.ItemPrimitive>
                  <span className={`text-[12px] ${isLast ? 'text-text-primary' : 'text-text-dim'}`}>
                    {segment}
                  </span>
                </Breadcrumb.ItemPrimitive>
                {!isLast && (
                  <Breadcrumb.Separator>
                    <VscChevronRight size={12} className="text-text-dim" />
                  </Breadcrumb.Separator>
                )}
              </Fragment>
            );
          })}
        </Breadcrumb.ListPrimitive>
      </Breadcrumb.Root>
    </div>
  );
}
