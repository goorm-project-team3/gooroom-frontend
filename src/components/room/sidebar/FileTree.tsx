import { useEditorStore } from '@/stores/editorStore';
import { Collapsible, Text } from '@vapor-ui/core';
import { useState } from 'react';
import {
  VscChevronDown,
  VscChevronRight,
  VscFile,
  VscFolder,
  VscFolderOpened,
} from 'react-icons/vsc';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const MOCK_TREE: FileNode[] = [
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    children: [
      { id: 'file-1', name: 'main.tsx', type: 'file' },
      { id: 'file-2', name: 'App.tsx', type: 'file' },
      {
        id: 'folder-components',
        name: 'components',
        type: 'folder',
        children: [{ id: 'file-3', name: 'button.tsx', type: 'file' }],
      },
    ],
  },
  { id: 'file-4', name: 'index.html', type: 'file' },
  { id: 'file-5', name: 'package.json', type: 'file' },
];

interface FileNodeItemProps {
  node: FileNode;
  depth: number;
}

function FileNodeItem({ node, depth }: FileNodeItemProps) {
  const { activeFileId, setActiveFile } = useEditorStore();
  const isActive = activeFileId === node.id;
  const paddingLeft = depth * 12 + 8;

  if (node.type === 'folder') {
    return <FolderNodeItem node={node} depth={depth} />;
  }

  return (
    <button
      className={`w-full flex items-center gap-1 py-[3px] transition-colors cursor-pointer ${isActive ? 'bg-bg-selected text-text-primary' : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}`}
      style={{ paddingLeft: paddingLeft + 18 }}
      onClick={() => setActiveFile(node.id)}
    >
      <VscFile size={14} />
      <Text typography="body3" className="ml-1 text-text-secondary">
        {node.name}
      </Text>
    </button>
  );
}

function FolderNodeItem({ node, depth }: FileNodeItemProps) {
  const [open, setOpen] = useState(true);
  const paddingLeft = depth * 12 + 8;

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        className="w-full flex items-center gap-1 py-[3px] hover:bg-bg-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        style={{ paddingLeft: paddingLeft }}
      >
        {open ? <VscChevronDown size={14} /> : <VscChevronRight size={14} />}
        {open ? (
          <VscFolderOpened size={14} className="text-[#e8ab70]" />
        ) : (
          <VscFolder size={14} className="text-[#e8ab70]" />
        )}
        <Text typography="body3" className="ml-1 text-text-secondary">
          {node.name}
        </Text>
      </Collapsible.Trigger>
      <Collapsible.Panel>
        {node.children?.map((child) => (
          <FileNodeItem key={child.id} node={child} depth={depth + 1} />
        ))}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

export default function FileTree() {
  return (
    <div className="flex flex-col py-1">
      {MOCK_TREE.map((node) => (
        <FileNodeItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
