import { useRoomStore } from '@/stores/roomStore';
import { Avatar, Badge } from '@vapor-ui/core';

const PROFILE_COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#eab308', '#ec4899', '#6366f1'];

const getProfileColor = (id: string) => {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PROFILE_COLORS[index % PROFILE_COLORS.length];
};

export default function MemberList() {
  const { members } = useRoomStore();

  return (
    <div className="flex flex-col py-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 px-4 py-2 hover:bg-bg-hover transition-colors"
        >
          {/* 프로밀 아바타 */}
          <div className="relative shrink-0">
            <Avatar.Root
              size="sm"
              shape="circle"
              alt={member.name}
              style={{ backgroundColor: getProfileColor(member.id) }}
            >
              <Avatar.FallbackPrimitive />
            </Avatar.Root>
          </div>

          {/* 이름 */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-text-primary truncate">{member.name}</span>
              {member.role === 'OWNER' && (
                <Badge size="sm" shape="pill" colorPalette="primary">
                  강사
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
