'use client';

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardApi } from '@/api/boardApi';
import { tenantApi } from '@/api/tenantApi';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Spinner } from '@/components/common/Spinner';
import { EditEntityModal } from '@/components/common/EditEntityModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ActivityPanel } from '@/components/activity/ActivityPanel';
import { MembersPanel } from '@/components/members/MembersPanel';
import {
  Plus,
  ArrowUpRight,
  Layout,
  Layers,
  ArrowLeft,
  Users,
  History,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Board, Tenant } from '@/types';

export default function TenantPage() {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [membersOpen, setMembersOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);

  const [tenantModalOpen, setTenantModalOpen] = React.useState(false);
  const [tenantSaving, setTenantSaving] = React.useState(false);
  const [tenantModalError, setTenantModalError] = React.useState<string | null>(null);

  const [deleteTenantOpen, setDeleteTenantOpen] = React.useState(false);
  const [deletingTenant, setDeletingTenant] = React.useState(false);
  const [deleteTenantError, setDeleteTenantError] = React.useState<string | null>(null);

  const [boardToEdit, setBoardToEdit] = React.useState<Board | null>(null);
  const [boardSaving, setBoardSaving] = React.useState(false);
  const [boardModalError, setBoardModalError] = React.useState<string | null>(null);

  const [boardToDelete, setBoardToDelete] = React.useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = React.useState(false);
  const [boardDeleteError, setBoardDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);

    Promise.all([tenantApi.getById(tenantId), boardApi.list(tenantId)])
      .then(([tenantResponse, boardResponse]) => {
        setTenant(tenantResponse.data.data.tenant);
        setBoards(boardResponse.data.data.boards);
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

  const handleTenantSave = async (values: Record<string, string>) => {
    if (!tenantId) return;
    setTenantSaving(true);
    setTenantModalError(null);
    try {
      const response = await tenantApi.update(tenantId, {
        name: values.name,
        slug: values.slug,
      });
      setTenant(response.data.data.tenant);
      setTenantModalOpen(false);
    } catch (err: unknown) {
      setTenantModalError(err instanceof Error ? err.message : 'Could not update tenant.');
    } finally {
      setTenantSaving(false);
    }
  };

  const handleTenantDelete = async () => {
    if (!tenantId) return;
    setDeletingTenant(true);
    setDeleteTenantError(null);
    try {
      await tenantApi.remove(tenantId);
      navigate(tenant?.organizationId ? `/organization/${tenant.organizationId}` : '/dashboard');
    } catch (err: unknown) {
      setDeleteTenantError(err instanceof Error ? err.message : 'Could not delete tenant.');
    } finally {
      setDeletingTenant(false);
    }
  };

  const handleBoardSave = async (values: Record<string, string>) => {
    if (!tenantId || !boardToEdit) return;
    setBoardSaving(true);
    setBoardModalError(null);
    try {
      const response = await boardApi.update(tenantId, boardToEdit._id, {
        name: values.name,
        description: values.description || '',
      });
      setBoards((current) =>
        current.map((board) =>
          board._id === boardToEdit._id ? response.data.data.board : board
        )
      );
      setBoardToEdit(null);
    } catch (err: unknown) {
      setBoardModalError(err instanceof Error ? err.message : 'Could not update board.');
    } finally {
      setBoardSaving(false);
    }
  };

  const handleBoardDelete = async () => {
    if (!tenantId || !boardToDelete) return;
    setDeletingBoard(true);
    setBoardDeleteError(null);
    try {
      await boardApi.remove(tenantId, boardToDelete._id);
      setBoards((current) => current.filter((board) => board._id !== boardToDelete._id));
      setBoardToDelete(null);
    } catch (err: unknown) {
      setBoardDeleteError(err instanceof Error ? err.message : 'Could not delete board.');
    } finally {
      setDeletingBoard(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title={tenant?.name || 'Boards'}
        description="Every board is a focused surface for a stream of work."
        icon={<Layers className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMembersOpen(true)}
              disabled={!tenant}
            >
              <Users className="h-4 w-4" />
              Members
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActivityOpen(true)}>
              <History className="h-4 w-4" />
              Activity
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateBoard}>
              <Plus className="h-4 w-4" />
              New board
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {tenant?.slug && <Badge variant="secondary">{tenant.slug}</Badge>}
          <Badge variant="secondary">
            <Layout className="h-3 w-3" />
            {boards.length} boards
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setTenantModalOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit tenant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTenantOpen(true)}
            className="text-slate-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
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
              className="group p-5 sm:p-6"
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
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setBoardModalError(null);
                      setBoardToEdit(board);
                    }}
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-violet-300"
                    aria-label={`Edit ${board.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setBoardDeleteError(null);
                      setBoardToDelete(board);
                    }}
                    className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    aria-label={`Delete ${board.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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

      <EditEntityModal
        open={tenantModalOpen}
        title="Edit tenant"
        description="Update the workspace name or slug."
        fields={[
          { name: 'name', label: 'Tenant name', required: true, maxLength: 120 },
          { name: 'slug', label: 'Slug', required: true, lowercase: true, maxLength: 80 },
        ]}
        initialValues={{ name: tenant?.name || '', slug: tenant?.slug || '' }}
        submitLabel="Save tenant"
        loading={tenantSaving}
        error={tenantModalError}
        onSubmit={(values) => void handleTenantSave(values)}
        onClose={() => {
          setTenantModalOpen(false);
          setTenantModalError(null);
        }}
      />

      <ConfirmDialog
        open={deleteTenantOpen}
        title={`Delete “${tenant?.name || 'tenant'}”?`}
        description="The tenant will be deactivated, its members will lose access, and it will disappear from your workspace. Boards and tasks are retained for historical records."
        confirmLabel="Delete tenant"
        loading={deletingTenant}
        error={deleteTenantError}
        onConfirm={() => void handleTenantDelete()}
        onClose={() => {
          setDeleteTenantOpen(false);
          setDeleteTenantError(null);
        }}
      />

      <EditEntityModal
        open={Boolean(boardToEdit)}
        title="Edit board"
        description="Rename the board or update its description."
        fields={[
          { name: 'name', label: 'Board name', required: true, maxLength: 120 },
          { name: 'description', label: 'Description', textarea: true, maxLength: 500 },
        ]}
        initialValues={{
          name: boardToEdit?.name || '',
          description: boardToEdit?.description || '',
        }}
        submitLabel="Save board"
        loading={boardSaving}
        error={boardModalError}
        onSubmit={(values) => void handleBoardSave(values)}
        onClose={() => {
          setBoardToEdit(null);
          setBoardModalError(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(boardToDelete)}
        title={`Delete “${boardToDelete?.name || 'board'}”?`}
        description="This permanently removes the board, its columns, and all tasks. This cannot be undone."
        confirmLabel="Delete board"
        loading={deletingBoard}
        error={boardDeleteError}
        onConfirm={() => void handleBoardDelete()}
        onClose={() => {
          setBoardToDelete(null);
          setBoardDeleteError(null);
        }}
      />

      {tenantId && (
        <MembersPanel
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          organizationId={tenant?.organizationId || ''}
          tenantId={tenantId}
          title="Tenant members"
        />
      )}

      <ActivityPanel
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        title="Workspace activity"
        description="Recent task changes across every board in this tenant."
        tenantId={tenantId}
      />
    </div>
  );
}
