import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useTenantId, useOrgId } from '@/store/tenantStore';

export function AppLayout() {
  const tenantId = useTenantId();
  const organizationId = useOrgId();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-48 left-1/3 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[160px]" />
        <div className="absolute -bottom-40 right-0 h-[460px] w-[460px] rounded-full bg-yellow-400/10 blur-[150px]" />
        <div className="absolute left-0 top-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-violet-800/15 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
      </div>

      <TopBar
        organizationId={organizationId}
        tenantId={tenantId}
        onMenuClick={() => setMobileOpen(true)}
      />

      <div className="mx-auto flex w-full max-w-[1700px] items-start">
        <Sidebar organizationId={organizationId} tenantId={tenantId} />
        <main className="min-h-[calc(100vh-73px)] min-w-0 flex-1 px-4 pb-20 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-9">
          <div key={location.pathname} className="w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        organizationId={organizationId}
        tenantId={tenantId}
      />
    </div>
  );
}
