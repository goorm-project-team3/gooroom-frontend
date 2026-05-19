import { Card, Badge } from '@vapor-ui/core';
import type { Room } from '@/types/room';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const isOwner = room.myRole === 'OWNER';

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
      <Card.Header className="flex items-start justify-between gap-2 mt-1 pb-10 p-0 border-b-0">
        <span className="text-[15px] font-bold text-white leading-snug">{room.name}</span>
        <Badge
          colorPalette={isOwner ? 'warning' : 'primary'}
          shape="pill"
          size="sm"
          className="shrink-0 text-[10px] font-bold"
        >
          {isOwner ? 'OWNER' : 'USER'}
        </Badge>
      </Card.Header>

      {/* 푸터 */}
      <Card.Footer className="flex items-center justify-between mt-auto p-0 border-t-0">
        <div className="flex items-center gap-1 text-[12px] text-text-dim">
          <span>참여 인원 : </span>
          <span>{room.memberCount}명</span>
        </div>
      </Card.Footer>
    </Card.Root>
  );
}
