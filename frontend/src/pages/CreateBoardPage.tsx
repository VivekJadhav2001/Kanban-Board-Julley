'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '@/api/boardApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { Layout, ArrowRight } from 'lucide-react';

export default function CreateBoardPage() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!tenantId) return;
      await boardApi.create(tenantId, { name, description });
      navigate(`/tenant/${tenantId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPageLayout
      backTo={`/tenant/${tenantId}`}
      backLabel="Boards"
      eyebrow="New board"
      title="Create board"
      description="Give this stream of work a name and a short description."
      icon={<Layout className="h-5 w-5" />}
    >
      {error && (
        <div className="mb-5">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Roadmap"
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this board for?"
        />
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create board'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>
    </FormPageLayout>
  );
}
