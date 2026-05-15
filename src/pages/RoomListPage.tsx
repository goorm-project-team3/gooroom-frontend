import { api } from '@/api/instance';
import { useQuery } from '@tanstack/react-query';
import type { Room } from '@/types/room';
import RoomCard from '@/components/room/RoomCard';
import { Button, Spinner } from '@vapor-ui/core';
import { useRoomStore } from '@/stores/roomStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import CreateRoomModal from '@/components/room/CreateRoomModal';
import JoinRoomModal from '@/components/room/JoinRoomModal';

export default function RoomListPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const { setRoom } = useRoomStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<{ rooms: Room[] }>('/rooms').then((res) => res.data.rooms),
  });

  const handleEnterRoom = (room: Room) => {
    setRoom(room.id, room.myRole);
    navigate(`/rooms/${room.id}`);
  };

  if (isLoading) return <Spinner size="xl" />;

  return (
    <div className="flex flex-col h-screen bg-bg-base overflow-hidden">
      {/* 상단 탑바 */}
      <header className="h-[52px] bg-bg-topbar border-b border-border flex items-center px-6 gap-4 shrink-0">
        <span className="text-[22px] font-extrabold text-white tracking-tight">
          Goo<span className="text-accent-orange">Room</span>
        </span>
        <div className="ml-auto flex items-center gap-2">{/* 추후 유저 칩 */}</div>
      </header>

      {/* 바디 */}
      <main className="flex-1 overflow-y-auto px-10 py-8 flex flex-col gap-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">강의 목록</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-accent-blue text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-[#1a8fe3] transition-colors"
            >
              + 강의 생성
            </button>
            <button
              onClick={() => setJoinModalOpen(true)}
              className="bg-transparent border border-border text-text-primary text-[13px] px-4 py-2 rounded-md hover:bg-bg-hover hover:border-text-secondary transition-colors"
            >
              참여하기
            </button>
          </div>
        </div>

        {/* 그리드 */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {data && data.length > 0 ? (
            data.map((room) => (
              <RoomCard key={room.id} room={room} onClick={() => handleEnterRoom(room)} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3 text-text-dim text-center">
              <p>참여 중인 강의가 없습니다.</p>
              <p className="text-sm">강의를 생성하거나 초대 코드로 참여해보세요.</p>
            </div>
          )}
        </div>
      </main>

      <CreateRoomModal isOpen={createModalOpen} onIsOpenChange={setCreateModalOpen} />
      <JoinRoomModal isOpen={joinModalOpen} onIsOpenChange={setJoinModalOpen} />
    </div>
  );
}
