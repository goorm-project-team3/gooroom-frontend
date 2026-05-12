import { create } from 'zustand';
import type { RoomMember, RoomRole } from '@/types/room';

interface RoomStore {
  roomId: string | null;
  role: RoomRole;
  members: RoomMember[];
}

export const useRoomStore = create<RoomStore>(() => ({
  roomId: null,
  role: 'USER',
  members: [],
}));
