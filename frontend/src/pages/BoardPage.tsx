'use client';

import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { columnApi } from '@/api/columnApi';
import { boardApi } from '@/api/boardApi';
import { useSocket } from '@/hooks/useSocket';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthUser } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Spinner } from '@/components/common/Spinner';
import { EditEntityModal } from '@/components/common/EditEntityModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ActivityPanel } from '@/components/activity/ActivityPanel';
import {
  CalendarDays,
  GripVertical,
  Layout,
  ListTodo,
  Plus,
  RefreshCw,
  ArrowLeft,
  Zap,
  ListChecks,
  Search,
  X,
  History,
  Pencil,
  Trash2,
  UserRound,
  SlidersHorizontal,
} from 'lucide-react';
import type { Board, Column, Task, TaskPriority } from '@/types';

type DropTarget = { columnId: string; index: number } | null;
type PriorityFilter = 'ALL' | TaskPriority;

const columnColors = [
  'from-violet-400 to-violet-600',
  'from-sky-400 to-sky-600',
  'from-amber-400 to-amber-600',
  'from-emerald-400 to-emerald-600',
  'from-rose-400 to-rose-600',
];

const priorityFilters: { value: PriorityFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function priorityStyle(priority: Task['priority']) {
  return {
    HIGH: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
    MEDIUM: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
    LOW: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  }[priority];
}

function formatDueDate(dueDate?: string | null) {
  if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(dueDate));
}

function assigneeOf(task: Task) {
  return typeof task.assignedTo === 'string' ? null : task.assignedTo;
}

export default function BoardPage() {
  const { tenantId, boardId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthUser();

  const [board, setBoard] = React.useState<Board | null>(null);
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget>(null);
  const [savingTaskId, setSavingTaskId] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState('');
  const [priorityFilter, setPriorityFilter] = React.useState<PriorityFilter>('ALL');
  const [onlyMine, setOnlyMine] = React.useState(false);

  const [activityOpen, setActivityOpen] = React.useState(false);

  const [boardModalOpen, setBoardModalOpen] = React.useState(false);
  const [boardSaving, setBoardSaving] = React.useState(false);
  const [boardModalError, setBoardModalError] = React.useState<string | null>(null);

  const [deleteBoardOpen, setDeleteBoardOpen] = React.useState(false);
  const [deletingBoard, setDeletingBoard] = React.useState(false);
  const [deleteBoardError, setDeleteBoardError] = React.useState<string | null>(null);

  const [columnToEdit, setColumnToEdit] = React.useState<Column | null>(null);
  const [columnSaving, setColumnSaving] = React.useState(false);
  const [columnModalError, setColumnModalError] = React.useState<string | null>(null);

  const [columnToDelete, setColumnToDelete] = React.useState<Column | null>(null);
  const [deletingColumn, setDeletingColumn] = React.useState(false);
  const [columnDeleteError, setColumnDeleteError] = React.useState<string | null>(null);

  React.useEffect(() => {
    useTenantStore.getState().setTenant(tenantId || null);
  }, [tenantId]);

  const updateTaskFromSocket = useCallback((data: { task?: Task }) => {
    if (data.task?.boardId === boardId) {
      setTasks((previous) => previous.map((task) => (task._id === data.task?._id ? data.task! : task)));
    }
  }, [boardId]);

  const handleTaskCreated = useCallback((data: { task?: Task }) => {
    if (data.task?.boardId === boardId) {
      setTasks((previous) => [...previous.filter((task) => task._id !== data.task?._id), data.task!]);
    }
  }, [boardId]);

  const handleTaskDeleted = useCallback((data: { taskId?: string }) => {
    if (data.taskId) setTasks((previous) => previous.filter((task) => task._id !== data.taskId));
  }, []);

  const handleColumnCreated = useCallback((data: { column?: Column }) => {
    if (data.column?.boardId === boardId) {
      setColumns((previous) => [
        ...previous.filter((column) => column._id !== data.column?._id),
        data.column!,
      ]);
    }
  }, [boardId]);

  const handleColumnUpdated = useCallback((data: { column?: Column }) => {
    if (data.column?.boardId === boardId) {
      setColumns((previous) =>
        previous.map((column) => (column._id === data.column?._id ? data.column! : column))
      );
    }
  }, [boardId]);

  const handleColumnDeleted = useCallback((data: { columnId?: string }) => {
    if (data.columnId) {
      setColumns((previous) => previous.filter((column) => column._id !== data.columnId));
    }
  }, []);

  const handleColumnsReordered = useCallback((data: { boardId?: string; columns?: Column[] }) => {
    if (data.boardId === boardId && data.columns) setColumns(data.columns);
  }, [boardId]);

  useSocket({
    'task:created': handleTaskCreated,
    'task:updated': updateTaskFromSocket,
    'task:deleted': handleTaskDeleted,
    'task:moved': updateTaskFromSocket,
    'task:reordered': updateTaskFromSocket,
    'column:created': handleColumnCreated,
    'column:updated': handleColumnUpdated,
    'column:deleted': handleColumnDeleted,
    'columns:reordered': handleColumnsReordered,
  });

  const loadData = useCallback(async () => {
    if (!boardId || !tenantId) return;
    setLoading(true);
    setError(null);
    try {
      const [boardResponse, columnResponse, taskResponse] = await Promise.all([
        boardApi.getById(tenantId, boardId),
        columnApi.list(boardId),
        taskApi.list(boardId),
      ]);
      setBoard(boardResponse.data.data.board);
      setColumns(columnResponse.data.data.columns);
      setTasks(taskResponse.data.data.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load board data.');
    } finally {
      setLoading(false);
    }
  }, [boardId, tenantId]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const isFiltering =
    search.trim().length > 0 || priorityFilter !== 'ALL' || onlyMine;

  const filteredTasks = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (query) {
        const haystack = `${task.title} ${task.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
      if (onlyMine) {
        const assigneeId =
          typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id;
        if (!currentUser?._id || assigneeId !== currentUser._id) return false;
      }
      return true;
    });
  }, [tasks, search, priorityFilter, onlyMine, currentUser?._id]);

  const orderedColumns = [...columns].sort((a, b) => a.position - b.position);
  const getTasksForColumn = (columnId: string) =>
    filteredTasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);

  const handleCreateTask = () => {
    if (boardId && tenantId) navigate(`/board/${tenantId}/${boardId}/task/create`);
  };

  const handleCreateColumn = () => {
    if (boardId && tenantId) navigate(`/board/${tenantId}/${boardId}/column/create`);
  };

  const getPositionAt = (columnId: string, index: number, movingTaskId: string) => {
    const columnTasks = getTasksForColumn(columnId).filter((task) => task._id !== movingTaskId);
    const before = columnTasks[index - 1];
    const after = columnTasks[index];
    if (!before && !after) return 1000;
    if (!before) return after.position - 1000;
    if (!after) return before.position + 1000;
    return (before.position + after.position) / 2;
  };

  const moveTask = async (targetColumnId: string, requestedIndex: number) => {
    if (!draggedTaskId || savingTaskId || isFiltering) return;
    const task = tasks.find((item) => item._id === draggedTaskId);
    if (!task) return;

    const sourceIndex = getTasksForColumn(task.columnId).findIndex((item) => item._id === task._id);
    const targetTasks = getTasksForColumn(targetColumnId).filter((item) => item._id !== task._id);
    let targetIndex = Math.max(0, Math.min(requestedIndex, targetTasks.length));
    // The drop index is measured before the dragged card is removed. Account for
    // that removal when moving a card further down within its current column.
    if (task.columnId === targetColumnId && requestedIndex > sourceIndex) targetIndex -= 1;
    if (task.columnId === targetColumnId && sourceIndex === targetIndex) return;

    const previousTasks = tasks;
    const position = getPositionAt(targetColumnId, targetIndex, task._id);
    const optimisticTask = { ...task, columnId: targetColumnId, position };
    setTasks((current) => current.map((item) => (item._id === task._id ? optimisticTask : item)));
    setSavingTaskId(task._id);
    setError(null);

    try {
      const response = task.columnId === targetColumnId
        ? await taskApi.reorder(task._id, { position, version: task.version })
        : await taskApi.move(task._id, { columnId: targetColumnId, position, version: task.version });
      setTasks((current) => current.map((item) => (item._id === task._id ? response.data.data.task : item)));
    } catch (err: unknown) {
      setTasks(previousTasks);
      setError(err instanceof Error ? err.message : 'Could not move this task. Please try again.');
    } finally {
      setSavingTaskId(null);
    }
  };

  const handleDrop = (columnId: string, fallbackIndex: number) => {
    if (isFiltering) return;
    const target = dropTarget?.columnId === columnId ? dropTarget : { columnId, index: fallbackIndex };
    void moveTask(target.columnId, target.index);
    setDropTarget(null);
    setDraggedTaskId(null);
  };

  const handleBoardSave = async (values: Record<string, string>) => {
    if (!tenantId || !boardId) return;
    setBoardSaving(true);
    setBoardModalError(null);
    try {
      const response = await boardApi.update(tenantId, boardId, {
        name: values.name,
        description: values.description || '',
      });
      setBoard(response.data.data.board);
      setBoardModalOpen(false);
    } catch (err: unknown) {
      setBoardModalError(err instanceof Error ? err.message : 'Could not update board.');
    } finally {
      setBoardSaving(false);
    }
  };

  const handleBoardDelete = async () => {
    if (!tenantId || !boardId) return;
    setDeletingBoard(true);
    setDeleteBoardError(null);
    try {
      await boardApi.remove(tenantId, boardId);
      navigate(`/tenant/${tenantId}`);
    } catch (err: unknown) {
      setDeleteBoardError(err instanceof Error ? err.message : 'Could not delete board.');
    } finally {
      setDeletingBoard(false);
    }
  };

  const handleColumnSave = async (values: Record<string, string>) => {
    if (!columnToEdit) return;
    setColumnSaving(true);
    setColumnModalError(null);
    try {
      const response = await columnApi.update(columnToEdit._id, { name: values.name });
      setColumns((current) =>
        current.map((column) =>
          column._id === columnToEdit._id ? response.data.data.column : column
        )
      );
      setColumnToEdit(null);
    } catch (err: unknown) {
      setColumnModalError(err instanceof Error ? err.message : 'Could not rename column.');
    } finally {
      setColumnSaving(false);
    }
  };

  const handleColumnDelete = async () => {
    if (!columnToDelete) return;
    setDeletingColumn(true);
    setColumnDeleteError(null);
    try {
      await columnApi.remove(columnToDelete._id);
      setColumns((current) => current.filter((column) => column._id !== columnToDelete._id));
      setColumnToDelete(null);
    } catch (err: unknown) {
      setColumnDeleteError(err instanceof Error ? err.message : 'Could not delete column.');
    } finally {
      setDeletingColumn(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPriorityFilter('ALL');
    setOnlyMine(false);
  };

  if (error && columns.length === 0) {
    return (
      <div className="mx-auto max-w-2xl pt-6 sm:pt-10">
        <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title={board?.name || 'Kanban board'}
        description={board?.description || 'Drag cards between columns to keep work flowing.'}
        icon={<ListTodo className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(`/tenant/${tenantId}`)}>
              <ArrowLeft className="h-4 w-4" />
              Boards
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActivityOpen(true)}>
              <History className="h-4 w-4" />
              Activity
            </Button>
            <Button variant="outline" size="sm" onClick={() => void loadData()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateColumn}>
              <Plus className="h-4 w-4" />
              Add column
            </Button>
            <Button variant="accent" size="sm" onClick={handleCreateTask} disabled={orderedColumns.length === 0}>
              <Plus className="h-4 w-4" />
              Add task
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <ListChecks className="h-3 w-3" />
            {isFiltering ? `${filteredTasks.length} of ${tasks.length} tasks` : `${tasks.length} tasks`}
          </Badge>
          <Badge variant="secondary">
            <Layout className="h-3 w-3" />
            {columns.length} columns
          </Badge>
          <Badge variant="success">
            <Zap className="h-3 w-3" />
            Realtime sync on
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setBoardModalOpen(true)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit board
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteBoardOpen(true)}
            className="text-slate-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks by title or description..."
            aria-label="Search tasks"
            className="h-10 w-full rounded-xl border border-white/10 bg-[#0F0F1A]/80 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500/80 transition-all duration-200 focus-visible:border-violet-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Priority
          </span>
          {priorityFilters.map((option) => {
            const active = priorityFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriorityFilter(option.value)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  active
                    ? 'border-violet-500/50 bg-violet-500/15 text-violet-200'
                    : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setOnlyMine((value) => !value)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              onlyMine
                ? 'border-yellow-400/50 bg-yellow-400/15 text-yellow-200'
                : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <UserRound className="h-3.5 w-3.5" />
            My tasks
          </button>
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-semibold text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isFiltering && (
        <p className="text-xs text-slate-500">
          Filters are active. Dragging is paused while the board is filtered, so ordering stays predictable.
        </p>
      )}

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      {loading && columns.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] py-24">
          <Spinner label="Loading board..." />
        </div>
      ) : orderedColumns.length === 0 ? (
        <section className="relative overflow-hidden rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-[0_0_30px_-6px_rgba(124,58,237,0.8)]">
            <Plus className="h-6 w-6" />
          </div>
          <h2 className="relative mt-5 text-lg font-semibold text-white">Build your workflow</h2>
          <p className="relative mx-auto mt-1 max-w-sm text-sm text-slate-400">
            Start with a column such as To do, In progress, or Done. You can add tasks once a
            column exists.
          </p>
          <Button variant="accent" onClick={handleCreateColumn} className="relative mt-5">
            <Plus className="h-4 w-4" />
            Create first column
          </Button>
        </section>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-3 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-4 md:p-6">
          <div className="flex min-h-[calc(100vh-340px)] items-start gap-4 overflow-x-auto pb-4 md:gap-5">
            {orderedColumns.map((column, columnIndex) => {
              const columnTasks = getTasksForColumn(column._id);
              const isTargetColumn = dropTarget?.columnId === column._id;
              return (
                <article
                  key={column._id}
                  className={`group w-[min(86vw,340px)] shrink-0 rounded-2xl border p-3.5 transition-all duration-200 ${
                    isTargetColumn
                      ? 'border-violet-500/50 bg-violet-500/[0.07] shadow-[0_0_40px_-12px_rgba(124,58,237,0.6)]'
                      : 'border-white/[0.06] bg-[#0F0F1A]/70'
                  }`}
                  onDragOver={(event) => {
                    if (isFiltering) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    if (draggedTaskId) setDropTarget({ columnId: column._id, index: columnTasks.length });
                  }}
                  onDrop={(event) => {
                    if (isFiltering) return;
                    event.preventDefault();
                    handleDrop(column._id, columnTasks.length);
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2 px-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${
                          columnColors[columnIndex % columnColors.length]
                        } shadow-[0_0_10px_rgba(124,58,237,0.7)]`}
                      />
                      <h2 className="truncate text-sm font-semibold text-white">{column.name}</h2>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setColumnModalError(null);
                          setColumnToEdit(column);
                        }}
                        className="rounded-md p-1 text-slate-500 opacity-100 transition-colors hover:bg-white/5 hover:text-violet-300 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label={`Rename ${column.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setColumnDeleteError(null);
                          setColumnToDelete(column);
                        }}
                        className="rounded-md p-1 text-slate-500 opacity-100 transition-colors hover:bg-red-500/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label={`Delete ${column.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="min-h-[360px] space-y-2.5 lg:min-h-[420px]">
                    {columnTasks.map((task, index) => {
                      const isDropBefore = dropTarget?.columnId === column._id && dropTarget.index === index;
                      const dueDate = formatDueDate(task.dueDate);
                      const assignee = assigneeOf(task);
                      return (
                        <React.Fragment key={task._id}>
                          {isDropBefore && !isFiltering && (
                            <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 shadow-[0_0_12px_rgba(124,58,237,0.8)]" aria-hidden="true" />
                          )}
                          <div
                            draggable={!isFiltering && savingTaskId !== task._id}
                            className={`group cursor-grab rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-[0_8px_28px_-8px_rgba(124,58,237,0.5)] active:cursor-grabbing ${
                              isFiltering ? 'cursor-pointer' : ''
                            } ${draggedTaskId === task._id ? 'opacity-40' : ''} ${
                              savingTaskId === task._id ? 'cursor-wait opacity-60' : ''
                            }`}
                            onDragStart={(event) => {
                              if (isFiltering) {
                                event.preventDefault();
                                return;
                              }
                              event.dataTransfer.effectAllowed = 'move';
                              event.dataTransfer.setData('text/plain', task._id);
                              setDraggedTaskId(task._id);
                              setDropTarget({ columnId: column._id, index });
                            }}
                            onDragOver={(event) => {
                              if (isFiltering) return;
                              event.preventDefault();
                              event.stopPropagation();
                              const bounds = event.currentTarget.getBoundingClientRect();
                              setDropTarget({ columnId: column._id, index: index + (event.clientY > bounds.top + bounds.height / 2 ? 1 : 0) });
                            }}
                            onDrop={(event) => {
                              if (isFiltering) return;
                              event.preventDefault();
                              event.stopPropagation();
                              const target = dropTarget ?? { columnId: column._id, index };
                              handleDrop(target.columnId, target.index);
                            }}
                            onDragEnd={() => {
                              setDraggedTaskId(null);
                              setDropTarget(null);
                            }}
                            onClick={() => navigate(`/board/${tenantId}/${boardId}/task/${task._id}/edit`)}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-violet-400" aria-hidden="true" />
                              <div className="min-w-0 flex-1">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${priorityStyle(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  {dueDate && (
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      {dueDate}
                                    </span>
                                  )}
                                </div>
                                <h3 className="break-words text-sm font-semibold leading-5 text-slate-100">
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                                    {task.description}
                                  </p>
                                )}
                                {assignee && (
                                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/20 text-[8px] font-bold text-violet-200">
                                      {assignee.name
                                        .split(' ')
                                        .map((part) => part[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </span>
                                    <span className="truncate">{assignee.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {dropTarget?.columnId === column._id && dropTarget.index === columnTasks.length && !isFiltering && (
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 shadow-[0_0_12px_rgba(124,58,237,0.8)]" aria-hidden="true" />
                    )}
                    {columnTasks.length === 0 && !isTargetColumn && (
                      <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center text-xs text-slate-500">
                        {isFiltering ? 'No matching tasks in this column' : 'Drop a task here or add a new one'}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateTask}
                    className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white/[0.04] hover:text-violet-300"
                  >
                    <Plus className="h-4 w-4" />
                    Add task
                  </button>
                </article>
              );
            })}
            <button
              type="button"
              onClick={handleCreateColumn}
              className="group flex w-[min(86vw,250px)] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 px-5 py-4 text-sm font-semibold text-slate-500 transition-all duration-200 hover:border-yellow-400/40 hover:bg-yellow-400/[0.04] hover:text-yellow-300"
            >
              <Plus className="h-4 w-4" />
              Add another column
            </button>
          </div>
        </section>
      )}

      <EditEntityModal
        open={boardModalOpen}
        title="Edit board"
        description="Rename the board or update its description."
        fields={[
          { name: 'name', label: 'Board name', required: true, maxLength: 120 },
          { name: 'description', label: 'Description', textarea: true, maxLength: 500 },
        ]}
        initialValues={{
          name: board?.name || '',
          description: board?.description || '',
        }}
        submitLabel="Save board"
        loading={boardSaving}
        error={boardModalError}
        onSubmit={(values) => void handleBoardSave(values)}
        onClose={() => {
          setBoardModalOpen(false);
          setBoardModalError(null);
        }}
      />

      <ConfirmDialog
        open={deleteBoardOpen}
        title="Delete this board?"
        description="This permanently removes the board, its columns, and all tasks. This cannot be undone."
        confirmLabel="Delete board"
        loading={deletingBoard}
        error={deleteBoardError}
        onConfirm={() => void handleBoardDelete()}
        onClose={() => {
          setDeleteBoardOpen(false);
          setDeleteBoardError(null);
        }}
      />

      <EditEntityModal
        open={Boolean(columnToEdit)}
        title="Rename column"
        description="Give this stage a clearer name."
        fields={[{ name: 'name', label: 'Column name', required: true, maxLength: 80 }]}
        initialValues={{ name: columnToEdit?.name || '' }}
        submitLabel="Save column"
        loading={columnSaving}
        error={columnModalError}
        onSubmit={(values) => void handleColumnSave(values)}
        onClose={() => {
          setColumnToEdit(null);
          setColumnModalError(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(columnToDelete)}
        title={`Delete “${columnToDelete?.name || 'column'}”?`}
        description="The column must be empty before it can be deleted. Move or delete its tasks first."
        confirmLabel="Delete column"
        loading={deletingColumn}
        error={columnDeleteError}
        onConfirm={() => void handleColumnDelete()}
        onClose={() => {
          setColumnToDelete(null);
          setColumnDeleteError(null);
        }}
      />

      <ActivityPanel
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
        title="Board activity"
        description="A timeline of everything happening on this board."
        boardId={boardId}
      />
    </div>
  );
}
