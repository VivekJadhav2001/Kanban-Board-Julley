'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { orgApi } from '@/api/orgApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { Building2, ArrowRight, CheckCircle2, Hash, Sparkles } from 'lucide-react';

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
    <FormPageLayout
      backTo="/dashboard"
      backLabel="Dashboard"
      eyebrow="New space"
      title="Create organization"
      description="Organizations group your tenants and the people who work in them."
      icon={<Building2 className="h-5 w-5" />}
    >
      {error && (
        <div className="mb-5">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">Organization details</h2>
              <p className="text-xs text-slate-400">Set up the shared home for your teams and workspaces.</p>
            </div>
          </div>

          <div className="space-y-5">
            <Input
              label="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corp"
              leftIcon={<Building2 className="h-4 w-4" />}
              required
            />
            <div>
              <Input
                label="Workspace URL"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="acme-corp"
                leftIcon={<Hash className="h-4 w-4" />}
                autoCapitalize="none"
                autoComplete="off"
                required
              />
              <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-slate-400">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                Use lowercase letters, numbers, and dashes. This appears in your workspace URLs.
              </p>
            </div>
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this organization work on?"
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating organization...' : 'Create organization'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>
    </FormPageLayout>
  );
}
