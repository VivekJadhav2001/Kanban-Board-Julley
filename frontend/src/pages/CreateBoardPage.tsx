'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { boardApi } from '@/api/boardApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { ArrowLeft } from 'lucide-react';

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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/tenant/${tenantId}`} className="flex items-center gap-2 p-2 rounded-md text-muted hover:bg-accent/10 hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-text-h">Create Board</h1>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Board Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Roadmap"
          required
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Board'}
        </Button>
      </form>
    </div>
  );
}
