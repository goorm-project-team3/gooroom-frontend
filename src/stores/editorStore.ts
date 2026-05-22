import { create } from 'zustand';

interface EditorStore {
  activeFileId: string | null;
  openedFiles: string[];
  setActiveFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  cursorPosition: { line: number; column: number };
  setCursorPosition: (line: number, column: number) => void;
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
  closeFile: (fileId) =>
    set((state) => {
      const index = state.openedFiles.indexOf(fileId);
      const newOpendFiles = state.openedFiles.filter((id) => id !== fileId);
      let newActiveFileId = state.activeFileId;
      if (state.activeFileId === fileId) {
        newActiveFileId = newOpendFiles[index - 1] ?? newOpendFiles[0] ?? null;
      }
      return {
        openedFiles: newOpendFiles,
        activeFileId: newActiveFileId,
      };
    }),
  cursorPosition: { line: 1, column: 1 },
  setCursorPosition: (line, column) => set({ cursorPosition: { line, column } }),
}));
