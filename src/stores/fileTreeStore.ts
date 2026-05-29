import { create } from 'zustand';

/**
 * 단일 노드 인터페이스
 */
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

/**
 * 로컬 전용 노드 고유 ID 생성 함수
 */
function generateId() {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * 트리를 순회하며 특정 파일 ID를 찾아 내용을 업데이트하는 함수
 * @param nodes 순회할 노드 배열
 * @param fileId content를 업데이트할 파일의 ID
 * @param content 업데이트할 내용
 * @returns
 */
function updateContentInTree(nodes: FileNode[], fileId: string, content: string): FileNode[] {
  return nodes.map((node) => {
    if (node.id === fileId) return { ...node, content };
    if (node.children) {
      return { ...node, children: updateContentInTree(node.children, fileId, content) };
    }
    return node;
  });
}

/**
 * 노드와 그 하위 노드들에서 파일 ID를 수집하는 함수
 * @param node 수집을 시작할 노드
 */
function collectFileIds(node: FileNode): string[] {
  if (node.type === 'file') return [node.id];
  return node.children?.flatMap(collectFileIds) ?? [];
}

/**
 * 트리에서 특정 노드 하위에 새 노드를 추가한 트리를 반환하는 함수
 * @param nodes 현재 트리 노드 배열
 * @param parentId 새 노드를 추가할 부모 노드의 ID (null이면 루트에 추가)
 * @param newNode 추가할 새 노드
 * @returns 새 노드가 추가된 트리 노드 배열
 */
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

/**
 * 트리에서 특정 노드를 제거한 트리를 반환하는 함수
 * @param nodes 현재 트리 노드 배열
 * @param nodeId 제거할 노드의 ID
 * @returns 노드가 제거된 트리 노드 배열
 */
function removeNodeFromTree(nodes: FileNode[], nodeId: string): FileNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) =>
      node.children ? { ...node, children: removeNodeFromTree(node.children, nodeId) } : node,
    );
}

/**
 * 트리에서 특정 노드를 찾는 함수
 * @param nodes 탐색할 노드 배열
 * @param nodeId 찾을 노드의 ID
 * @returns 찾은 노드 또는 null
 */
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

/**
 * 특정 노드의 부모 ID를 찾는 함수
 * @param nodes 탐색할 노드 배열
 * @param targetId 부모를 찾을 노드의 ID
 * @return 부모 노드의 ID, 루트 노드인 경우 null, 찾지 못한 경우 undefined
 */
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

/**
 * 노드의 전체 경로를 반환하는 함수
 * @param nodeId 경로를 찾을 노드의 ID
 * @param nodes 탐색할 노드 배열
 * @param prefix 현재까지의 경로 접두사 (재귀적으로 사용)
 * @returns 노드의 전체 경로 (예: "src/components/Button.tsx") 또는 빈 문자열 (노드를 찾지 못한 경우)
 */
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

/**
 * 노드가 특정 조상 노드의 하위에 있는지 확인하는 함수
 * @param nodes 현재 트리 노드 배열
 * @param nodeId 이동할 노드의 ID
 * @param potentialAncestorId 확인할 조상 노드의 ID
 * @returns nodeId가 potentialAncestorId의 하위에 있으면 true, 그렇지 않으면 false
 */
function isDescendant(nodes: FileNode[], nodeId: string, potentialAncestorId: string): boolean {
  const ancestor = findNode(nodes, potentialAncestorId);
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

  /**
   * 서버에서 받은 파일 목록으로 트리를 재구성하는 함수
   * @param serverFiles 서버에서 받은 파일 목록
   */
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

  /**
   * 서버에서 받은 파일을 트리에 추가하는 함수
   * @param serverFile 서버에서 받은 파일 정보
   */
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
