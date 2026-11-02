'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tenantApi } from '@/api/tenantApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { Layers, ArrowRight } from 'lucide-react';

export default function CreateTenantPage() {
  const navigate = useNavigate();
  const { organizationId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!organizationId) return;
      await tenantApi.create(organizationId, { name, slug });
      navigate(`/organization/${organizationId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPageLayout
      backTo={`/organization/${organizationId}`}
      backLabel="Organization"
      eyebrow="New workspace"
      title="Create tenant"
      description="Tenants keep boards, members, and realtime events isolated for each team."
      icon={<Layers className="h-5 w-5" />}
    >
      {error && (
        <div className="mb-5">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Tenant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Team"
          required
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="product-team"
          required
        />
        <p className="-mt-2 text-xs text-slate-500">
          A short, unique identifier for this workspace inside the organization.
        </p>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create tenant'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>
    </FormPageLayout>
  );
}
