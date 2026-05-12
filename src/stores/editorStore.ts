import { create } from 'zustand';

interface EditorStore {
  activeFileId: string | null;
  openedFiles: string[];
  setActiveFile: (fileId: string) => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  activeFileId: null,
  openedFiles: [],
  setActiveFile: (fileId) =>
    set((state) => ({
      activeFileId: fileId,
      openedFiles: state.openedFiles.includes(fileId)
        ? state.openedFiles
        : [...state.openedFiles, fileId],
    })),
}));
