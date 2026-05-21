import { create } from 'zustand';
import type { RoomMember, RoomRole } from '@/types/room';

type ReactionType = 'understand' | 'confused';
interface ReactionCounts {
  understand: number;
  confused: number;
}

interface RoomStore {
  roomId: string | null;
  roomName: string | null;
  role: RoomRole;
  members: RoomMember[];
  setRoom: (roomId: string, role: RoomRole, roomName?: string) => void;
  clearRoom: () => void;

  isReactionOpen: boolean;
  reactionCounts: ReactionCounts;
  myReaction: ReactionType | null;
  openReaction: () => void;
  closeReaction: () => void;
  resetReaction: () => void;
  submitReaction: (reaction: ReactionType) => void;
  reactionClosedAt: number | null;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  roomName: null,
  role: 'USER',
  members: [],
  setRoom: (roomId, role, roomName) => set({ roomId, role, roomName: roomName ?? null }),
  clearRoom: () => set({ roomId: null, role: 'USER', members: [] }),
  isReactionOpen: false,
  reactionCounts: { understand: 0, confused: 0 },
  myReaction: null,
  openReaction: () => set({ isReactionOpen: true, reactionClosedAt: null }),
  closeReaction: () => set({ isReactionOpen: false, reactionClosedAt: Date.now() }),
  resetReaction: () =>
    set({
      reactionCounts: { understand: 0, confused: 0 },
      myReaction: null,
      reactionClosedAt: null,
    }),
  submitReaction: (reaction) =>
    set((state) => {
      const prev = state.myReaction;
      const counts = { ...state.reactionCounts };

      if (prev) counts[prev] = Math.max(0, counts[prev] - 1);

      if (prev === reaction) {
        return { reactionCounts: counts, myReaction: null };
      }
      counts[reaction] += 1;
      return { reactionCounts: counts, myReaction: reaction };
    }),
  reactionClosedAt: null,
}));
