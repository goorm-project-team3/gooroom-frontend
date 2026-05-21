import { Card, Badge } from '@vapor-ui/core';
import type { Room } from '@/types/room';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const isOwner = room.userRole === 'OWNER';

  return (
    <Card.Root
      onClick={onClick}
      className="bg-bg-card border border-border rounded-[10px] p-5 cursor-pointer flex flex-col gap-3 relative overflow-hidden transition-all duration-200 hover:border-accent-blue hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
    >
      {/* 상단 역할 컬러 바 */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[10px] ${isOwner ? 'bg-accent-orange' : 'bg-accent-blue'}`}
      />

      {/* 헤더 */}
      <Card.Header className="flex items-start justify-between gap-2 mt-1 p-0 border-b-0">
        <span className="text-[15px] font-bold text-white leading-snug">{room.name}</span>
        <div className="flex items-center gap-1 shrink-0">
          <Badge
            shape="pill"
            size="sm"
            className={`shrink-0 text-[10px] font-bold ${isOwner ? 'bg-accent-orange text-white' : 'bg-accent-blue text-white'}`}
          >
            {isOwner ? 'OWNER' : 'USER'}
          </Badge>
          <Badge
            shape="pill"
            size="sm"
            className={`text-[10px] font-bold ${room.visibility === 'PRIVATE' ? 'bg-bg-hover text-text-primary' : 'bg-accent-green text-white'}`}
          >
            {room.visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC'}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="flex flex-1">
        {room.description && (
          <p className="text-[12px] text-text-dim leading-relaxed line-clamp-2">
            {room.description}
          </p>
        )}
      </Card.Body>

      {/* 푸터 */}
      <Card.Footer className="flex items-center justify-between mt-auto p-0 border-t-0">
        <div className="flex items-center gap-1 text-[12px] text-text-dim">
          <span>참여 인원 : </span>
          <span>{room.participantCount}명</span>
        </div>
      </Card.Footer>
    </Card.Root>
  );
}
