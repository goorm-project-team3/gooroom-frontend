export type RoomRole = 'OWNER' | 'USER';

export interface RoomMember {
  id: string;
  name: string;
  role: RoomRole;
}

export interface Room {
  id: string;
  name: string;
  memberCount: number;
  myRole: RoomRole;
}

export type SidebarType = 'explorer' | 'search' | 'members';
