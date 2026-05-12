import { create } from 'zustand';

interface FocusStore {
  isFocusMode: boolean;
  toggleFocusMode: () => void;
}

export const useFocusStore = create<FocusStore>((set) => ({
  isFocusMode: false,
  toggleFocusMode: () => set((state) => ({ isFocusMode: !state.isFocusMode })),
}));
