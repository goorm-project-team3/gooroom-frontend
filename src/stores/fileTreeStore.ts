import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeStore {
  files: FileNode[];
  addNode: (parentId: string | null, name: string, type: 'file' | 'folder') => string;
  removeNode: (id: string) => void;
  getDescendantFileIds: (nodeId: string) => string[];
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

export const useFileTreeStore = create<FileTreeStore>((set, get) => ({
  files: INITIAL_TREE,

  addNode: (parentId, name, type) => {
    const newNode: FileNode = {
      id: generateId(),
      name,
      type,
      ...(type === 'folder' ? { children: [] } : {}),
    };
    set((state) => ({ files: addNodeToTree(state.files, parentId, newNode) }));
    return newNode.id;
  },

  removeNode: (nodeId) => {
    set((state) => ({ files: removeNodeFromTree(state.files, nodeId) }));
  },

  getDescendantFileIds: (nodeId) => {
    const node = findNode(get().files, nodeId);
    if (!node) return [];
    return collectFileIds(node);
  },
}));
