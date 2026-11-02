'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { orgApi } from '@/api/orgApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await orgApi.create({ name, slug, description });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 p-2 rounded-md text-muted hover:bg-accent/10 hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-text-h">Create Organization</h1>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center gap-2 text-accent font-bold text-lg">
        <Building2 className="h-6 w-6" />
        <span>Julley</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Corp"
          required
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="acme-corp"
          required
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your organization"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Organization'}
        </Button>
      </form>
    </div>
  );
}
