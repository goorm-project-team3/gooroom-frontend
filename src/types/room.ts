export type RoomRole = 'OWNER' | 'USER';

export interface RoomMember {
  id: string;
  name: string;
  role: RoomRole;
}
