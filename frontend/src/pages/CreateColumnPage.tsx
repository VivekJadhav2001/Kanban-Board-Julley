'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { columnApi } from '@/api/columnApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { ArrowLeft } from 'lucide-react';

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
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/board/${tenantId}/${boardId}`} className="flex items-center gap-2 p-2 rounded-md text-muted hover:bg-accent/10 hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-text-h">Create Column</h1>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Column Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="To Do"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Column'}
        </Button>
      </form>
    </div>
  );
}
