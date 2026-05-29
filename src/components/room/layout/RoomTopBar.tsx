import { useFocusStore } from '@/stores/focusStore';
import { useRoomStore } from '@/stores/roomStore';
import { Avatar, Button, Text } from '@vapor-ui/core';
import { useNavigate } from 'react-router-dom';

const PROFILE_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ec4899', '#6366f1'];

function getProfileColor(id: string) {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PROFILE_COLORS[index % PROFILE_COLORS.length];
}

export default function RoomTopBar() {
  const { role, members, roomName } = useRoomStore();
  const { isFocusMode, toggleFocusMode } = useFocusStore();

  const navigate = useNavigate();
  const visibleMembers = members.slice(0, 4);
  const overflowCount = members.length - visibleMembers.length;

  return (
    <header className="h-[44px] flex items-center justify-between px-4 bg-bg-topbar border-b border-border shrink-0">
      {/* 좌측 : 홈 버튼 + 강의룸 이름 */}
      <div className="flex items-center gap-3">
        <span
          className="text-[18px] font-extrabold text-white tracking-tight cursor-pointer"
          onClick={() => navigate('/')}
        >
          Goo<span className="text-accent-orange">Room</span>
        </span>
        {roomName && (
          <>
            <span className="text-text-dim text-[14px]">/</span>
            <Text typography="body3" className="text-text-secondary">
              {roomName}
            </Text>
          </>
        )}
      </div>

      {/* 우측 */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {visibleMembers.map((member) => (
            <Avatar.Root
              key={member.id}
              alt={member.name}
              title={member.name}
              shape="circle"
              size="sm"
              style={{
                backgroundColor: getProfileColor(member.id),
                outline: '1px solid var(--color-bg-topbar)',
              }}
            >
              <Avatar.FallbackPrimitive />
            </Avatar.Root>
          ))}
          {overflowCount > 0 && (
            <Avatar.Root
              size="sm"
              shape="circle"
              alt={`${overflowCount}`}
              title={`+${overflowCount} 명`}
            ></Avatar.Root>
          )}
        </div>

        {role === 'USER' ? (
          <Button
            size="sm"
            variant={isFocusMode ? 'fill' : 'outline'}
            onClick={toggleFocusMode}
            colorPalette={isFocusMode ? 'primary' : 'secondary'}
          >
            {isFocusMode ? 'FOCUS ON' : 'FOCUS OFF'}
          </Button>
        ) : null}
      </div>
    </header>
  );
}
