'use client';

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { orgApi } from '@/api/orgApi';
import { Button } from '@/components/common/Button';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Plus, ArrowRight, Building2 as OrgIcon } from 'lucide-react';
import type { Organization } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-h">Dashboard</h1>
          <p className="text-muted">Welcome back, {user?.name || 'there'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/profile" className="px-3 py-1.5 rounded-md text-sm font-medium text-text-h hover:bg-accent/10">
            Profile
          </Link>
        </div>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center gap-4">
        <Button onClick={handleCreateOrg} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Create Organization'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted">
            <p>No organizations yet.</p>
            <Button
              onClick={handleCreateOrg}
              variant="outline"
              className="mt-4"
            >
              Create your first organization
            </Button>
          </div>
        )}
        {organizations.map((org) => (
          <div
            key={org._id}
            className="border border-input rounded-lg p-4 hover:border-accent/50 transition-colors cursor-pointer group"
            onClick={() => navigate(`/organization/${org._id}`)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <OrgIcon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-text-h group-hover:text-accent">{org.name}</h3>
            </div>
            <p className="text-sm text-muted mb-4">{org.description || 'No description'}</p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                {org.slug}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
