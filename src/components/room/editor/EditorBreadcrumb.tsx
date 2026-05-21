import { useEditorStore } from '@/stores/editorStore';
import { Breadcrumb } from '@vapor-ui/core';
import { VscChevronRight } from 'react-icons/vsc';
import { Fragment } from 'react';

const FILE_PATHS: Record<string, string[]> = {
  'file-1': ['src', 'main.tsx'],
  'file-2': ['src', 'App.tsx'],
  'file-3': ['src', 'components', 'button.tsx'],
  'file-4': ['index.html'],
  'file-5': ['package.json'],
};

export default function EditorBreadcrumb() {
  const { activeFileId } = useEditorStore();

  if (!activeFileId) {
    return <div className="h-[24px] bg-bg-base border-b border-border shrink-0" />;
  }

  const segments = FILE_PATHS[activeFileId] ?? [activeFileId];

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
