import { Card, Badge, Button } from '@vapor-ui/core';
import type { Room } from '@/types/room';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const isOwner = room.myRole === 'OWNER';

  return (
    <div
      onClick={onClick}
      className="bg-bg-card border border-border rounded-[10px] p-5 cursor-pointer flex flex-col gap-3 relative overflow-hidden transition-all duration-200 hover:border-accent-blue hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
    >
      {/* 상단 역할 컬러 바 */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[10px] ${isOwner ? 'bg-accent-orange' : 'bg-accent-blue'}`}
      />

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-2 mt-1 pb-10">
        <span className="text-[15px] font-bold text-white leading-snug">{room.name}</span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            isOwner
              ? 'bg-[rgba(245,158,11,0.2)] text-accent-orange'
              : 'bg-[rgba(0,122,204,0.2)] text-[#5db0f0]'
          }`}
        >
          {isOwner ? 'OWNER' : 'USER'}
        </span>
      </div>

      {/* 푸터 */}
      <div className="flex items-center justify-between mt-auto">
        {/* 멤버 수 */}
        <div className="flex items-center gap-1 text-[12px] text-text-dim ">
          <span>참여 인원 : </span>
          <span>{room.memberCount}명</span>
        </div>
        <div>
          <span className="bg-accent-blue text-white text-[12px] font-semibold px-4 py-1.5 rounded-full hover:bg-[#1a8fe3] transition-colors">
            입장
          </span>
        </div>
      </div>
    </div>
  );
}
