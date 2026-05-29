import type { SidebarType } from '@/types/room';
import { IconButton } from '@vapor-ui/core';
import { VscAccount, VscFiles, VscSearch, VscSettingsGear } from 'react-icons/vsc';

interface ActivityBarProps {
  activeSidebar: SidebarType | null;
  onSidebarChange: (type: SidebarType) => void;
}

export default function ActivityBar({ activeSidebar, onSidebarChange }: ActivityBarProps) {
  const handleClick = (type: SidebarType) => {
    onSidebarChange(type);
  };

  return (
    <nav className="w-[52px] bg-bg-activity flex flex-col items-center py-2 shrink-0 border-r border-border">
      {/* 상단 */}
      <div className="flex flex-col items-center gap-1">
        {/* 탐색기 */}
        <div className="relative">
          {activeSidebar === 'explorer' && (
            <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-text-primary rounded-r-sm" />
          )}
          <IconButton
            size="md"
            variant="ghost"
            shape="square"
            colorPalette="secondary"
            onClick={() => handleClick('explorer')}
            title="Explorer"
            className={activeSidebar === 'explorer' ? 'text-text-primary' : 'text-text-dim'}
          >
            <VscFiles size={22} />
          </IconButton>
        </div>

        {/* 검색 */}
        <div className="relative">
          {activeSidebar === 'search' && (
            <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-text-primary rounded-r-sm" />
          )}
          <IconButton
            size="md"
            variant="ghost"
            shape="square"
            colorPalette="secondary"
            onClick={() => handleClick('search')}
            title="Search"
            className={activeSidebar === 'search' ? 'text-text-primary' : 'text-text-dim'}
          >
            <VscSearch size={22} />
          </IconButton>
        </div>

        {/* 멤버 */}
        <div className="relative">
          {activeSidebar === 'members' && (
            <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-text-primary rounded-r-sm" />
          )}
          <IconButton
            size="md"
            variant="ghost"
            shape="square"
            colorPalette="secondary"
            onClick={() => handleClick('members')}
            title="Members"
            className={activeSidebar === 'members' ? 'text-text-primary' : 'text-text-dim'}
          >
            <VscAccount size={22} />
          </IconButton>
        </div>
      </div>

      {/* 하단 : 설정 */}
      <div className="mt-auto">
        <IconButton
          size="md"
          variant="ghost"
          shape="square"
          colorPalette="secondary"
          title="Manage"
          className="text-text-dim"
        >
          <VscSettingsGear size={22} />
        </IconButton>
      </div>
    </nav>
  );
}
