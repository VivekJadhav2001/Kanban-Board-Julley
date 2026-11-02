import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useTenantId, useOrgId } from '@/store/tenantStore';

export function AppLayout() {
  const tenantId = useTenantId();
  const organizationId = useOrgId();
  const location = useLocation();

  const showSidebar = ['/dashboard', '/organization'].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar organizationId={organizationId} tenantId={tenantId} />
      <div className="flex">
        {showSidebar && <Sidebar organizationId={organizationId} />}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
