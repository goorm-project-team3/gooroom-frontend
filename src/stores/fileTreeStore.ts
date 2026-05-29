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
  addFileFromServer: (serverFile: { id: number; name: string; language: string | null }) => void;
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

export function findNode(nodes: FileNode[], nodeId: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children) {
      const found = findNode(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

export function findParentId(
  nodes: FileNode[],
  targetId: string,
  parentId: string | null = null,
): string | null | undefined {
  for (const node of nodes) {
    if (node.id === targetId) return parentId;
    if (node.children) {
      const found = findParentId(node.children, targetId, node.id);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export function getNodePath(nodeId: string, nodes: FileNode[], prefix = ''): string {
  for (const node of nodes) {
    const current = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.id === nodeId) return current;
    if (node.children) {
      const found = getNodePath(nodeId, node.children, current);
      if (found) return found;
    }
  }
  return '';
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
    const root: FileNode[] = [];

    for (const file of serverFiles) {
      const parts = file.name.split('/');
      const fileName = parts.pop()!;
      let current = root;
      let pathSoFar = '';

      for (const part of parts) {
        pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
        let folder = current.find((n) => n.name === part && n.type === 'folder');
        if (!folder) {
          folder = { id: `folder-${pathSoFar}`, name: part, type: 'folder', children: [] };
          current.push(folder);
        }
        current = folder.children!;
      }

      current.push({
        id: String(file.id),
        name: fileName,
        type: 'file',
        language: file.language ?? undefined,
      });
    }

    set({ files: root });
  },

  addFileFromServer: (serverFile) => {
    set((state) => {
      if (findNode(state.files, String(serverFile.id))) return state;

      const root = JSON.parse(JSON.stringify(state.files)) as FileNode[];
      const parts = serverFile.name.split('/');
      const fileName = parts.pop()!;
      let current = root;
      let pathSoFar = '';

      for (const part of parts) {
        pathSoFar = pathSoFar ? `${pathSoFar}/${part}` : part;
        let folder = current.find((n) => n.name === part && n.type === 'folder');
        if (!folder) {
          folder = { id: `folder-${pathSoFar}`, name: part, type: 'folder', children: [] };
          current.push(folder);
        }
        current = folder.children!;
      }

      current.push({
        id: String(serverFile.id),
        name: fileName,
        type: 'file',
        language: serverFile.language ?? undefined,
      });

      return { files: root };
    });
  },
}));
