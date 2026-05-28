import { create } from 'zustand';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
}

interface FileTreeStore {
  files: FileNode[];
  setFilesFromServer: (
    serverFiles: Array<{ id: number; name: string; language: string | null }>,
  ) => void;
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
  files: [],

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

  setFilesFromServer: (serverFiles) => {
    const nodes: FileNode[] = serverFiles.map((file) => ({
      id: String(file.id),
      name: file.name,
      type: 'file' as const,
      language: file.language ?? undefined,
    }));
    set({ files: nodes });
  },
}));
