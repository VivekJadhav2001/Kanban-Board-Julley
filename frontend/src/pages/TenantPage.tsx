'use client';

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardApi } from '@/api/boardApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Spinner } from '@/components/common/Spinner';
import { Plus, ArrowUpRight, Layout, Layers, ArrowLeft } from 'lucide-react';
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
      <PageHeader
        eyebrow="Workspace"
        title="Boards"
        description="Every board is a focused surface for a stream of work."
        icon={<Layers className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateBoard}>
              <Plus className="h-4 w-4" />
              New board
            </Button>
          </>
        }
      />

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">All boards</h2>
          <p className="text-sm text-slate-500">Open a board to manage columns and tasks.</p>
        </div>
        <Badge variant="secondary">{boards.length} total</Badge>
      </div>

      {loading ? (
        <Card className="p-10">
          <Spinner label="Loading boards..." />
        </Card>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={<Layout className="h-6 w-6" />}
          title="No boards yet"
          description="Create a board for a project, sprint, or process, then add columns to shape your workflow."
          action={
            <Button variant="accent" onClick={handleCreateBoard}>
              <Plus className="h-4 w-4" />
              Create your first board
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boards.map((board, index) => (
            <Card
              key={board._id}
              interactive
              className="group p-5"
              onClick={() => navigate(`/board/${tenantId}/${board._id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-violet-300 transition-colors group-hover:bg-violet-500/25 group-hover:text-violet-200">
                  <Layout className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                  Board {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 truncate text-base font-semibold text-white transition-colors group-hover:text-violet-200">
                {board.name}
              </h3>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
                {board.description || 'No description yet.'}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                <span className="text-[11px] font-medium text-slate-500">Open board</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 transition-all group-hover:bg-violet-500 group-hover:text-white">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={handleCreateBoard}
            className="group flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5 text-slate-500 transition-all duration-300 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] hover:text-yellow-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition-colors group-hover:border-yellow-400/40 group-hover:bg-yellow-400/10">
              <Plus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">New board</span>
          </button>
        </div>
      )}
    </div>
  );
}
