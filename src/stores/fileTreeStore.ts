import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

interface FileTreeStore {
  files: FileNode[];
  addNode: (
    parentId: string | null,
    name: string,
    type: 'file' | 'folder',
    content?: string,
  ) => string;
  removeNode: (id: string) => void;
  getDescendantFileIds: (nodeId: string) => string[];
  moveNode: (nodeId: string, newParentId: string | null) => void;
  updateFileContent: (fileId: string, content: string) => void;
}

function generateId() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const INITIAL_TREE: FileNode[] = [
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'file-1',
        name: 'main.tsx',
        type: 'file',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      },
      {
        id: 'file-2',
        name: 'App.tsx',
        type: 'file',
        content: `export default function App() {
  return <div>Hello, GooRoom!</div>;
}`,
      },
      {
        id: 'folder-components',
        name: 'components',
        type: 'folder',
        children: [
          {
            id: 'file-3',
            name: 'button.tsx',
            type: 'file',
            content: `interface ButtonProps {
  label: string;
  onClick: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}`,
          },
        ],
      },
    ],
  },
  {
    id: 'file-4',
    name: 'index.html',
    type: 'file',
    content: `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>GooRoom</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  },
  {
    id: 'file-5',
    name: 'package.json',
    type: 'file',
    content: `{
  "name": "gooroom",
  "version": "1.0.0"
}`,
  },
];

function updateContentInTree(nodes: FileNode[], fileId: string, content: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === fileId) return { ...node, content };
    if (node.children) {
      return { ...node, children: updateContentInTree(node.children, fileId, content) };
    }
    return node;
  });
}

function collectFileIds(node: FileNode): string[] {
  if (node.type === 'file') return [node.id];
  return node.children?.flatMap(collectFileIds) ?? [];
}

function addNodeToTree(nodes: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] {
  if (parentId === null) return [...nodes, newNode];
  return nodes.map((node) => {
    if (node.id === parentId && node.type === 'folder') {
      return { ...node, children: [...(node.children ?? []), newNode] };
    }
    if (node.children) {
      return { ...node, children: addNodeToTree(node.children, parentId, newNode) };
    }
    return node;
  });
}

function removeNodeFromTree(nodes: FileNode[], nodeId: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) =>
      node.children ? { ...node, children: removeNodeFromTree(node.children, nodeId) } : node,
    );
}

function findNode(nodes: FileNode[], nodeId: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function isDescendant(nodes: FileNode[], nodeId: string, poentialAncestorId: string): boolean {
  const ancestor = findNode(nodes, poentialAncestorId);
  if (!ancestor || ancestor.type !== 'folder') return false;
  return !!findNode(ancestor.children ?? [], nodeId);
}

export const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  files: INITIAL_TREE,

  addNode: (parentId, name, type, content) => {
    const newNode: FileNode = {
      id: generateId(),
      name,
      type,
      ...(type === 'folder' ? { children: [] } : { content: content ?? '' }),
    };
    set((state) => ({ files: addNodeToTree(state.files, parentId, newNode) }));
    return newNode.id;
  },

  removeNode: (nodeId) => {
    set((state) => ({ files: removeNodeFromTree(state.files, nodeId) }));
  },

  moveNode: (nodeId, newParentId) => {
    set((state) => {
      if (nodeId === newParentId) return state;
      if (newParentId !== null && isDescendant(state.files, nodeId, newParentId)) return state;
      const nodeToMove = findNode(state.files, nodeId);
      if (!nodeToMove) return state;
      const withoutNode = removeNodeFromTree(state.files, nodeId);
      return { files: addNodeToTree(withoutNode, newParentId, nodeToMove) };
    });
  },

  getDescendantFileIds: (nodeId) => {
    const node = findNode(get().files, nodeId);
    if (!node) return [];
    return collectFileIds(node);
  },

  updateFileContent: (fileId, content) => {
    set((state) => ({ files: updateContentInTree(state.files, fileId, content) }));
  },
}));
