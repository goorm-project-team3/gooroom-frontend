import { create } from 'zustand';
import type { RoomMember, RoomRole } from '@/types/room';

interface RoomStore {
  roomId: string | null;
  role: RoomRole;
  members: RoomMember[];
  setRoom: (roomId: string, role: RoomRole) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  roomId: null,
  role: 'USER',
  members: [],
  setRoom: (roomId, role) => set({ roomId, role }),
  clearRoom: () => set({ roomId: null, role: 'USER', members: [] }),
}));
