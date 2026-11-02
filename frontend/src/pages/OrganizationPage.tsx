'use client';

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantApi } from '@/api/tenantApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Spinner } from '@/components/common/Spinner';
import { Plus, ArrowUpRight, Building2, Layers, ArrowLeft } from 'lucide-react';
import type { Tenant } from '@/types';

export default function OrganizationPage() {
  const { organizationId } = useParams();
  const navigate = useNavigate();
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!organizationId) return;
    setLoading(true);
    tenantApi
      .list(organizationId)
      .then((res) => {
        setTenants(res.data.data.tenants);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load tenants');
      })
      .finally(() => setLoading(false));
  }, [organizationId]);

  const handleCreateTenant = () => {
    if (!organizationId) return;
    navigate(`/organization/${organizationId}/tenant/create`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Tenants"
        description="Tenants isolate boards, members, and realtime events for each team."
        icon={<Building2 className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateTenant}>
              <Plus className="h-4 w-4" />
              New tenant
            </Button>
          </>
        }
      />

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">All tenants</h2>
          <p className="text-sm text-slate-500">Choose a tenant to open its boards.</p>
        </div>
        <Badge variant="secondary">{tenants.length} total</Badge>
      </div>

      {loading ? (
        <Card className="p-10">
          <Spinner label="Loading tenants..." />
        </Card>
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="No tenants yet"
          description="Create a tenant for each product, department, or client you want to keep separate."
          action={
            <Button variant="accent" onClick={handleCreateTenant}>
              <Plus className="h-4 w-4" />
              Create your first tenant
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tenants.map((tenant) => (
            <Card
              key={tenant._id}
              interactive
              className="group p-5"
              onClick={() => navigate(`/tenant/${tenant._id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25 group-hover:text-violet-200">
                  <Layers className="h-5 w-5" />
                </div>
                <Badge variant={tenant.isActive ? 'success' : 'muted'}>
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <h3 className="mt-4 truncate text-base font-semibold text-white transition-colors group-hover:text-violet-200">
                {tenant.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{tenant.slug}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[11px] font-medium text-slate-500">Open boards</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 transition-all group-hover:bg-violet-500 group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={handleCreateTenant}
            className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 text-slate-500 transition-all duration-300 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] hover:text-yellow-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-colors group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">New tenant</span>
          </button>
        </div>
      )}
    </div>
  );
}
