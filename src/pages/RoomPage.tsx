import ActivityBar from '@/components/room/layout/ActivityBar';
import RoomTopBar from '@/components/room/layout/RoomTopBar';
import { useRoomStore } from '@/stores/roomStore';
import { useEffect, useState } from 'react';
import { SidebarType } from '@/types/room';
import Sidebar from '@/components/room/layout/Sidebar';
import EditorArea from '@/components/room/layout/EditorArea';
import RightPanel from '@/components/room/layout/RightPanel';
import BottomPanel from '@/components/room/layout/BottomPanel';
import StatusBar from '@/components/room/layout/StatusBar';
import { useParams } from 'react-router-dom';
import { api } from '@/api/instance';

export default function RoomPage() {
  const [activeSidebar, setActiveSidebar] = useState<SidebarType | null>('explorer');
  const { roomId } = useParams<{ roomId: string }>();
  const setRoom = useRoomStore((s) => s.setRoom);

  const handleSidebarChange = (type: SidebarType) => {
    setActiveSidebar((prev) => (prev === type ? null : type));
  };

  useEffect(() => {
    api.get(`/api/rooms/${roomId}`).then((res) => {
      setRoom(String(res.data.id), res.data.data.userRole, res.data.data.name);
    });

    useRoomStore.setState({
      roomId: roomId ?? null,
      members: [
        { id: 'user-1', name: '김강사', role: 'OWNER' },
        { id: 'user-2', name: '박학생', role: 'USER' },
        { id: 'user-3', name: '이학생', role: 'USER' },
        { id: 'user-4', name: '최학생', role: 'USER' },
        { id: 'user-5', name: '정학생', role: 'USER' },
        { id: 'user-6', name: '임학생', role: 'USER' },
      ],
    });
  }, [roomId]);

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      {/* TopBar */}
      <RoomTopBar />

      {/* 메인 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* ActivityBar */}
        <ActivityBar activeSidebar={activeSidebar} onSidebarChange={handleSidebarChange} />

        {/* Sidebar */}
        <Sidebar activeSidebar={activeSidebar} />

        {/* 중앙 + 우측 영역 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* EditorArea + RightPanel */}
          <div className="flex flex-1 overflow-hidden">
            {/* EditorArea */}
            <EditorArea />

            {/* RightPanel*/}
            <RightPanel />
          </div>

          {/* BottomPanel */}
          <BottomPanel />

          {/* StatusBar */}
          <StatusBar />
        </div>
      </div>
    </div>
  );
}
