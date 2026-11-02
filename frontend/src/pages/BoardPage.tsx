'use client';

import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { columnApi } from '@/api/columnApi';
import { useSocket } from '@/hooks/useSocket';
import { useTenantStore } from '@/store/tenantStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Spinner } from '@/components/common/Spinner';
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
} from 'lucide-react';
import type { Column, Task } from '@/types';

type DropTarget = { columnId: string; index: number } | null;

const columnColors = [
  'from-violet-400 to-violet-600',
  'from-sky-400 to-sky-600',
  'from-amber-400 to-amber-600',
  'from-emerald-400 to-emerald-600',
  'from-rose-400 to-rose-600',
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

export default function BoardPage() {
  const { tenantId, boardId } = useParams();
  const navigate = useNavigate();
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget>(null);
  const [savingTaskId, setSavingTaskId] = React.useState<string | null>(null);

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

  useSocket({
    'task:created': handleTaskCreated,
    'task:updated': updateTaskFromSocket,
    'task:deleted': handleTaskDeleted,
    'task:moved': updateTaskFromSocket,
    'task:reordered': updateTaskFromSocket,
  });

  const loadData = useCallback(async () => {
    if (!boardId) return;
    setLoading(true);
    setError(null);
    try {
      const [columnResponse, taskResponse] = await Promise.all([columnApi.list(boardId), taskApi.list(boardId)]);
      setColumns(columnResponse.data.data.columns);
      setTasks(taskResponse.data.data.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load board data.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const orderedColumns = [...columns].sort((a, b) => a.position - b.position);
  const getTasksForColumn = (columnId: string) => tasks
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
    if (!draggedTaskId || savingTaskId) return;
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
    const target = dropTarget?.columnId === columnId ? dropTarget : { columnId, index: fallbackIndex };
    void moveTask(target.columnId, target.index);
    setDropTarget(null);
    setDraggedTaskId(null);
  };

  if (error && columns.length === 0) {
    return (
      <div className="mx-auto max-w-2xl pt-10">
        <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1800px] space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Kanban board"
        description="Drag cards between columns to keep work flowing."
        icon={<ListTodo className="h-5 w-5" />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(`/tenant/${tenantId}`)}>
              <ArrowLeft className="h-4 w-4" />
              Boards
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

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <ListChecks className="h-3 w-3" />
          {tasks.length} tasks
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
        <section className="overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-3 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl md:p-5">
          <div className="flex min-h-[calc(100vh-330px)] items-start gap-4 overflow-x-auto pb-4">
            {orderedColumns.map((column, columnIndex) => {
              const columnTasks = getTasksForColumn(column._id);
              const isTargetColumn = dropTarget?.columnId === column._id;
              return (
                <article
                  key={column._id}
                  className={`w-[min(86vw,340px)] shrink-0 rounded-2xl border p-3 transition-all duration-200 ${
                    isTargetColumn
                      ? 'border-violet-500/50 bg-violet-500/[0.07] shadow-[0_0_40px_-12px_rgba(124,58,237,0.6)]'
                      : 'border-white/[0.06] bg-[#0F0F1A]/70'
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                    if (draggedTaskId) setDropTarget({ columnId: column._id, index: columnTasks.length });
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleDrop(column._id, columnTasks.length);
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-br ${
                          columnColors[columnIndex % columnColors.length]
                        } shadow-[0_0_10px_rgba(124,58,237,0.7)]`}
                      />
                      <h2 className="truncate text-sm font-semibold text-white">{column.name}</h2>
                    </div>
                    <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="min-h-[420px] space-y-2">
                    {columnTasks.map((task, index) => {
                      const isDropBefore = dropTarget?.columnId === column._id && dropTarget.index === index;
                      const dueDate = formatDueDate(task.dueDate);
                      return (
                        <React.Fragment key={task._id}>
                          {isDropBefore && (
                            <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 shadow-[0_0_12px_rgba(124,58,237,0.8)]" aria-hidden="true" />
                          )}
                          <div
                            draggable={savingTaskId !== task._id}
                            className={`group cursor-grab rounded-xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-3 shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-[0_8px_28px_-8px_rgba(124,58,237,0.5)] active:cursor-grabbing ${
                              draggedTaskId === task._id ? 'opacity-40' : ''
                            } ${savingTaskId === task._id ? 'cursor-wait opacity-60' : ''}`}
                            onDragStart={(event) => {
                              event.dataTransfer.effectAllowed = 'move';
                              event.dataTransfer.setData('text/plain', task._id);
                              setDraggedTaskId(task._id);
                              setDropTarget({ columnId: column._id, index });
                            }}
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              const bounds = event.currentTarget.getBoundingClientRect();
                              setDropTarget({ columnId: column._id, index: index + (event.clientY > bounds.top + bounds.height / 2 ? 1 : 0) });
                            }}
                            onDrop={(event) => {
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
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    {dropTarget?.columnId === column._id && dropTarget.index === columnTasks.length && (
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 shadow-[0_0_12px_rgba(124,58,237,0.8)]" aria-hidden="true" />
                    )}
                    {columnTasks.length === 0 && !isTargetColumn && (
                      <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-white/10 px-4 text-center text-xs text-slate-500">
                        Drop a task here or add a new one
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
    </div>
  );
}
