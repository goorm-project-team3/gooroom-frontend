import ActivityBar from '@/components/room/layout/ActivityBar';
import RoomTopBar from '@/components/room/layout/RoomTopBar';
import { useRoomStore } from '@/stores/roomStore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarType } from '@/types/room';
import FileTree from '@/components/room/sidebar/FileTree';
import MemberList from '@/components/room/sidebar/MemberList';

export default function RoomPage() {
  const [activeSidebar, setActiveSidebar] = useState<SidebarType | null>('explorer');
  const { roomId } = useParams();

  const handleSidebarChange = (type: SidebarType) => {
    setActiveSidebar((prev) => (prev === type ? null : type));
  };

  useEffect(() => {
    useRoomStore.setState({
      members: [
        { id: 'user-1', name: '김강사', role: 'OWNER' },
        { id: 'user-2', name: '박학생', role: 'USER' },
        { id: 'user-3', name: '이학생', role: 'USER' },
        { id: 'user-4', name: '최학생', role: 'USER' },
        { id: 'user-5', name: '정학생', role: 'USER' },
        { id: 'user-6', name: '임학생', role: 'USER' },
      ],
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-bg-base overflow-hidden">
      {/* TopBar */}
      <RoomTopBar roomName={`강의룸 ${roomId}`} />

      {/* 메인 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* ActivityBar */}
        <ActivityBar activeSidebar={activeSidebar} onSidebarChange={handleSidebarChange} />

        {/* Sidebar */}
        {activeSidebar !== null && (
          <div className="w-[240px] bg-bg-sidebar shrink-0 flex flex-col overflow-y-auto">
            {activeSidebar === 'explorer' && <FileTree />}
            {activeSidebar === 'search' && (
              <span className="text-text-dim text-xs p-4">Search</span>
            )}
            {activeSidebar === 'members' && <MemberList />}
          </div>
        )}

        {/* 중앙 + 우측 영역 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* EditorArea + RightPanel */}
          <div className="flex flex-1 overflow-hidden">
            {/* EditorArea */}
            <div className="flex-1 bg-bg-base flex items-center justify-center">
              <span className="text-text-dim text-xs">Editor</span>
            </div>

            {/* RightPanel*/}
            <div className="w-[280px] bg-bg-panel shrink-0 flex items-center justify-center">
              <span className="text-text-dim text-xs">Chat</span>
            </div>
          </div>

          {/* BottomPanel */}
          <div className="h-[200px] bg-bg-panel shrink-0 flex items-center justify-center border-t border-border">
            <span className="text-text-dim text-xs">Bottom</span>
          </div>

          {/* StatusBar */}
          <div className="h-[28px] bg-bg-activity shrink-0 flex items-center px-3 border-t border-border">
            <span className="text-text-dim text-xs">StatusBar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
