'use client';

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardApi } from '@/api/boardApi';
import { Button } from '@/components/common/Button';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Plus, Layout, ArrowRight } from 'lucide-react';
import type { Board } from '@/types';

export default function TenantPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    boardApi
      .list(tenantId)
      .then((res) => {
        setBoards(res.data.data.boards);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load boards');
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleCreateBoard = () => {
    if (!tenantId) return;
    navigate(`/tenant/${tenantId}/board/create`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-h">Tenant Boards</h1>
          <p className="text-muted">Manage your kanban boards</p>
        </div>
        <Button onClick={handleCreateBoard} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Create Board'}
        </Button>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted">
            <p>No boards yet.</p>
            <Button
              onClick={handleCreateBoard}
              variant="outline"
              className="mt-4"
            >
              Create your first board
            </Button>
          </div>
        )}
        {boards.map((board) => (
          <div
            key={board._id}
            className="border border-input rounded-lg p-4 hover:border-accent/50 transition-colors cursor-pointer group"
            onClick={() => navigate(`/board/${tenantId}/${board._id}`)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Layout className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-text-h group-hover:text-accent">{board.name}</h3>
            </div>
            <p className="text-sm text-muted mb-4">{board.description || 'No description'}</p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Open board
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
