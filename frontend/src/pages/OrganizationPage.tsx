'use client';

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tenantApi } from '@/api/tenantApi';
import { Button } from '@/components/common/Button';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Plus, ArrowRight, Building2 as OrgIcon } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-h">Organization</h1>
          <p className="text-muted">Manage tenants and members</p>
        </div>
        <Button onClick={handleCreateTenant} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Create Tenant'}
        </Button>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted">
            <p>No tenants yet.</p>
            <Button
              onClick={handleCreateTenant}
              variant="outline"
              className="mt-4"
            >
              Create your first tenant
            </Button>
          </div>
        )}
        {tenants.map((tenant) => (
          <div
            key={tenant._id}
            className="border border-input rounded-lg p-4 hover:border-accent/50 transition-colors cursor-pointer group"
            onClick={() => navigate(`/tenant/${tenant._id}`)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <OrgIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-text-h group-hover:text-accent">{tenant.name}</h3>
            </div>
            <p className="text-sm text-muted mb-4">{tenant.slug}</p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                {tenant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
