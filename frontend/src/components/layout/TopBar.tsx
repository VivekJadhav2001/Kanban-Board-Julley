import { Building2 } from 'lucide-react';

interface TopBarProps {
  organizationId?: string | null;
  tenantId?: string | null;
}

export function TopBar({ organizationId, tenantId }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-input bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-accent font-bold text-lg hidden sm:flex">
            <Building2 className="h-6 w-6" />
            <span>Julley</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col items-end">
            {tenantId ? <p className="text-xs text-muted">Tenant</p> : null}
            {organizationId ? (
              <p className="text-sm font-medium text-text-h">Organization</p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
