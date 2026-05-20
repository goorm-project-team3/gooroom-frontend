import type { SidebarType } from '@/types/room';
import FileTree from '../sidebar/FileTree';
import MemberList from '../sidebar/MemberList';
import SearchPanel from '../sidebar/SearchPanel';

interface SidebarProps {
  activeSidebar: SidebarType | null;
}

const SIDEBAR_TITLES: Record<SidebarType, string> = {
  explorer: 'EXPLORER',
  search: 'SEARCH',
  members: 'MEMBERS',
};

export default function Sidebar({ activeSidebar }: SidebarProps) {
  if (activeSidebar === null) return null;

  return (
    <div className="w-[240px] bg-bg-sidebar shrink-0 flex flex-col overflow-hidden border-r border-border">
      {/* 헤더 */}
      <div className="px-4 py-1 shrink-0">
        <span className="text-[11px] font-semibold text-text-primary uppercase tracking-widest">
          {SIDEBAR_TITLES[activeSidebar]}
        </span>
      </div>

      {/* 콘텐츠 */}
      {activeSidebar === 'explorer' && <FileTree />}
      {activeSidebar === 'search' && <SearchPanel />}
      {activeSidebar === 'members' && <MemberList />}
    </div>
  );
}
