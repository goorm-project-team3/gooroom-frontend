import { api } from '@/api/instance';
import { useQuery } from '@tanstack/react-query';
import type { Room } from '@/types/room';
import RoomCard from '@/components/room/RoomCard';
import { Spinner } from '@vapor-ui/core';

export default function RoomListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: () => api.get<{ rooms: Room[] }>('/rooms').then((res) => res.data.rooms),
  });

  if (isLoading) return <Spinner size="xl" />;

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      {data?.map((room) => (
        <RoomCard key={room.id} room={room} onClick={() => console.log(room.id)} />
      ))}
    </div>
  );
}
