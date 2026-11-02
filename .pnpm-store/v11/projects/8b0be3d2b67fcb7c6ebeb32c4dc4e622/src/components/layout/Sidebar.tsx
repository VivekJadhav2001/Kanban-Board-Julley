import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  LogOut,
  LayoutDashboard,
  User,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthUser, useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/common/Avatar';

interface SidebarProps {
  organizationId?: string | null;
  tenantId?: string | null;
}

function useNavItems(organizationId?: string | null, tenantId?: string | null) {
  const items = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  if (organizationId) {
    items.push({ label: 'Organization', href: `/organization/${organizationId}`, icon: Building2 });
  }

  if (tenantId) {
    items.push({ label: 'Workspace', href: `/tenant/${tenantId}`, icon: Layers });
  }

  return items;
}

function SidebarContent({
  organizationId,
  tenantId,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthUser();
  const logout = useAuthStore((state) => state.logout);
  const navItems = useNavItems(organizationId, tenantId);

  const handleSignOut = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    logout();
    onNavigate?.();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 px-2 py-1"
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_0_24px_-4px_rgba(124,58,237,0.8)]">
          <Building2 className="h-5 w-5 text-white" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0A0A0F] bg-yellow-400" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-white">Julley</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
            Kanban Studio
          </p>
        </div>
      </Link>

      <div className="mt-8 px-2">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Navigate
        </p>
        <nav className="mt-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? location.pathname === '/' || location.pathname.startsWith('/dashboard')
                : location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/25 to-violet-500/5 text-white shadow-[inset_0_0_0_1px_rgba(124,58,237,0.35)]'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-violet-400 to-violet-600 shadow-[0_0_12px_rgba(124,58,237,0.9)]" />
                )}
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-colors',
                    isActive ? 'text-violet-300' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 px-2">
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/15 to-transparent p-4">
          <Sparkles className="absolute -right-2 -top-2 h-14 w-14 text-violet-500/10" />
          <p className="text-xs font-semibold text-violet-200">Stay in flow</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
            Drag cards between columns to keep momentum and ship faster.
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name} src={user?.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user?.name || 'Member'}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email || 'Signed in'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ organizationId, tenantId }: SidebarProps) {
  return (
    <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-[264px] shrink-0 border-r border-white/[0.06] px-4 py-6 lg:block">
      <SidebarContent organizationId={organizationId} tenantId={tenantId} />
    </aside>
  );
}

interface MobileSidebarProps extends SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose, organizationId, tenantId }: MobileSidebarProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute left-0 top-0 h-full w-[290px] border-r border-white/10 bg-[#0C0C16]/95 px-4 py-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent
          organizationId={organizationId}
          tenantId={tenantId}
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}
