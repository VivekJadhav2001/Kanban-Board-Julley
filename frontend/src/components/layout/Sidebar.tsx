import { Building2, LogOut, LayoutDashboard, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  organizationId?: string | null;
}

export function Sidebar({ organizationId }: SidebarProps) {
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Members', href: `/organization/${organizationId}/members`, icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-input bg-background">
      <div className="p-4">
        <div className="flex items-center gap-2 text-accent font-bold text-lg mb-8">
          <Building2 className="h-6 w-6" />
          <span>Julley</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === window.location.pathname;
            return (
              <button
                key={item.label}
                onClick={() => window.location.assign(item.href)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-white'
                    : 'text-text hover:bg-accent/10 hover:text-accent'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-input">
        <button
          onClick={() => {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            window.location.assign('/login');
          }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <div className="md:hidden fixed inset-0 z-50 bg-background border-r border-input flex flex-col h-full">
      <div className="p-4 flex items-center justify-between border-b border-input">
        <span className="text-accent font-bold text-lg">Julley</span>
        <button className="text-text">✕</button>
      </div>
    </div>
  );
}
