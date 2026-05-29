export type RoomRole = 'OWNER' | 'USER';

export interface RoomMember {
  id: string;
  name: string;
  role: RoomRole;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  visibility: string;
  userRole: RoomRole;
  participantCount: number;
  createdAt: string;
}

export type SidebarType = 'explorer' | 'search' | 'members';
