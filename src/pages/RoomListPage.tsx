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
    <div className="p-6">
      <div className="flex justify-center items-center mb-6">
        <h1>강의 목록</h1>
        <Button onClick={() => setCreateModalOpen(true)}>강의 생성</Button>
        <Button onClick={() => setJoinModalOpen(true)}>강의 참여</Button>
      </div>
      <div className="p-6 grid grid-cols-3 gap-4">
        {data && data.length > 0 ? (
          data?.map((room) => (
            <RoomCard key={room.id} room={room} onClick={() => handleEnterRoom(room)} />
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-text-secondary">
            <p>참여 중인 강의가 없습니다.</p>
            <p>강의를 생성하거나 초대 코드로 참여해보세요.</p>
          </div>
        )}
      </div>
      <CreateRoomModal isOpen={createModalOpen} onIsOpenChange={setCreateModalOpen} />
      <JoinRoomModal isOpen={joinModalOpen} onIsOpenChange={setJoinModalOpen} />
    </div>
  );
}
