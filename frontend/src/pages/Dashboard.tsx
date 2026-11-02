'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTenantId } from '@/store/tenantStore';
import { orgApi } from '@/api/orgApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import {
  Plus,
  ArrowUpRight,
  Building2 as OrgIcon,
  Layers,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import type { Organization } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tenantId = useTenantId();
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    orgApi
      .list()
      .then((res) => {
        setOrganizations(res.data.data.organizations);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load organizations');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateOrg = () => {
    navigate('/organization/create');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Pick up where you left off and keep your teams moving forward."
        icon={<LayoutDashboard className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Your profile
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateOrg}>
              <Plus className="h-4 w-4" />
              New organization
            </Button>
          </>
        }
      />

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-violet-300">
              <OrgIcon className="h-5 w-5" />
            </div>
            <Badge variant="default">Live</Badge>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Organizations
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-white">
            {loading ? '—' : organizations.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Spaces you belong to</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/25 bg-yellow-400/15 text-yellow-300">
              <Layers className="h-5 w-5" />
            </div>
            <Badge variant={tenantId ? 'accent' : 'muted'}>{tenantId ? 'Active' : 'Idle'}</Badge>
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-white">
            {tenantId ? 'Ready' : 'None'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {tenantId ? 'A tenant is selected' : 'Open a tenant to start a board'}
          </p>
        </Card>

        <Card className="relative overflow-hidden p-5 sm:col-span-2 xl:col-span-1">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-600/20 blur-2xl" />
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <Sparkles className="h-4 w-4 text-yellow-300" />
          </div>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Session
          </p>
          <p className="mt-1 text-lg font-bold tracking-tight text-white">Secured & synced</p>
          <p className="mt-1 text-xs text-slate-500">
            Realtime updates flow only to your tenant members.
          </p>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-white">Your organizations</h2>
            <p className="text-sm text-slate-500">Open an organization to manage its tenants.</p>
          </div>
          <Badge variant="secondary">{organizations.length} total</Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <EmptyState
            icon={<OrgIcon className="h-6 w-6" />}
            title="No organizations yet"
            description="Organizations hold your tenants and keep teammates scoped to the right work."
            action={
              <Button variant="accent" onClick={handleCreateOrg}>
                <Plus className="h-4 w-4" />
                Create your first organization
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {organizations.map((org) => (
              <Card
                key={org._id}
                interactive
                className="group p-5"
                onClick={() => navigate(`/organization/${org._id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25 group-hover:text-violet-200">
                    <OrgIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                    {org.slug}
                  </span>
                </div>
                <h3 className="mt-4 truncate text-base font-semibold text-white transition-colors group-hover:text-violet-200">
                  {org.name}
                </h3>
                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
                  {org.description || 'No description yet.'}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-[11px] font-medium text-slate-500">Open workspace</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 transition-all group-hover:bg-violet-500 group-hover:text-white">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Card>
            ))}

            <button
              type="button"
              onClick={handleCreateOrg}
              className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 text-slate-500 transition-all duration-300 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] hover:text-yellow-300"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-colors group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10">
                <Plus className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">New organization</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
