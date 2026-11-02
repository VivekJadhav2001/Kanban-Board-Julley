'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { columnApi } from '@/api/columnApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { Columns3, ArrowRight } from 'lucide-react';

export default function CreateColumnPage() {
  const navigate = useNavigate();
  const { tenantId, boardId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!tenantId || !boardId) return;
      await columnApi.create(boardId, { name });
      navigate(`/board/${tenantId}/${boardId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create column');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPageLayout
      backTo={`/board/${tenantId}/${boardId}`}
      backLabel="Board"
      eyebrow="New column"
      title="Create column"
      description="Columns represent stages in your workflow, from backlog to done."
      icon={<Columns3 className="h-5 w-5" />}
    >
      {error && (
        <div className="mb-5">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Column name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="To do"
          required
        />
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <p className="text-xs leading-relaxed text-slate-500">
            Good examples: Backlog, In progress, In review, Done. You can add more columns at any
            time.
          </p>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create column'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>
    </FormPageLayout>
  );
}
