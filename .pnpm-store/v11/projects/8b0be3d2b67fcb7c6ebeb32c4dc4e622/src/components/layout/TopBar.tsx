import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, ChevronRight, Layers, Menu } from 'lucide-react';
import { useAuthUser } from '@/store/authStore';
import { Avatar } from '@/components/common/Avatar';

interface TopBarProps {
  organizationId?: string | null;
  tenantId?: string | null;
  onMenuClick?: () => void;
}

function getPageLabel(pathname: string) {
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname.includes('/task/create')) return 'New task';
  if (pathname.includes('/task/')) return 'Edit task';
  if (pathname.includes('/column/create')) return 'New column';
  if (pathname.includes('/board/create')) return 'New board';
  if (pathname.includes('/tenant/create')) return 'New workspace';
  if (pathname.includes('/organization/create')) return 'New organization';
  if (pathname.startsWith('/board/')) return 'Board';
  if (pathname.startsWith('/tenant/')) return 'Workspace';
  if (pathname.startsWith('/organization/')) return 'Organization';
  return 'Dashboard';
}

export function TopBar({ organizationId, tenantId, onMenuClick }: TopBarProps) {
  const location = useLocation();
  const user = useAuthUser();
  const pageLabel = getPageLabel(location.pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1700px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-slate-300 transition-colors hover:border-violet-500/40 hover:text-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_0_18px_-4px_rgba(124,58,237,0.8)]">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">Julley</span>
          </div>

          <div className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
            <span className="text-slate-500">Workspace</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="truncate font-semibold text-slate-200">{pageLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <ContextChip
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Organization"
              active={!!organizationId}
            />
            <ContextChip
              icon={<Layers className="h-3.5 w-3.5" />}
              label="Tenant"
              active={!!tenantId}
            />
          </div>

          <Link
            to="/profile"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10"
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <span className="hidden max-w-[120px] truncate text-xs font-semibold text-slate-200 sm:block">
              {user?.name || 'Profile'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function ContextChip({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={
        active
          ? 'inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-300'
          : 'inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[11px] font-medium text-slate-500'
      }
    >
      {icon}
      {label}
    </span>
  );
}
