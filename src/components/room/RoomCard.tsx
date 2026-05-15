import { Card, Badge, Button } from '@vapor-ui/core';
import type { Room } from '@/types/room';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  return (
    <Card.Root onClick={onClick} className="cursor-pointer">
      <Card.Header>
        <span>{room.name}</span>
        <Badge>{room.myRole}</Badge>
      </Card.Header>
      <Card.Body>
        <span>{room.memberCount}명</span>
      </Card.Body>
    </Card.Root>
  );
}
