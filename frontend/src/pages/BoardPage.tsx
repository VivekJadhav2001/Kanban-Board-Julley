'use client';

import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { columnApi } from '@/api/columnApi';
import { useSocket } from '@/hooks/useSocket';
import { useTenantStore } from '@/store/tenantStore';
import { Button } from '@/components/common/Button';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Plus, Layout, Edit, RefreshCw } from 'lucide-react';
import type { Task, Column } from '@/types';

export default function BoardPage() {
  const { tenantId, boardId } = useParams();
  const navigate = useNavigate();
  const [columns, setColumns] = React.useState<Column[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    useTenantStore.getState().setTenant(tenantId || null);
  }, [tenantId]);

  const handleTaskCreated = useCallback((data: any) => {
    if (data.task?.boardId === boardId) {
      setTasks((prev) => [...prev, data.task]);
    }
  }, [boardId]);

  const handleTaskUpdated = useCallback((data: any) => {
    if (data.task?.boardId === boardId) {
      setTasks((prev) =>
        prev.map((t) => (t._id === data.task._id ? data.task : t))
      );
    }
  }, [boardId]);

  const handleTaskDeleted = useCallback((data: any) => {
    if (data.taskId) {
      setTasks((prev) => prev.filter((t) => t._id !== data.taskId));
    }
  }, []);

  const handleTaskMoved = useCallback((data: any) => {
    if (data.task?.boardId === boardId) {
      setTasks((prev) =>
        prev.map((t) => (t._id === data.task._id ? data.task : t))
      );
    }
  }, [boardId]);

  useSocket({
    'task:created': handleTaskCreated,
    'task:updated': handleTaskUpdated,
    'task:deleted': handleTaskDeleted,
    'task:moved': handleTaskMoved,
  });

  const loadData = async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const [colRes, taskRes] = await Promise.all([
        columnApi.list(boardId),
        taskApi.list(boardId),
      ]);
      setColumns(colRes.data.data.columns);
      setTasks(taskRes.data.data.tasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [boardId]);

  const handleRefresh = () => {
    loadData();
  };

  const handleCreateTask = () => {
    if (!boardId || !tenantId) return;
    navigate(`/board/${tenantId}/${boardId}/task/create`);
  };

  const handleCreateColumn = () => {
    if (!boardId || !tenantId) return;
    navigate(`/board/${tenantId}/${boardId}/column/create`);
  };

  const getTasksForColumn = (columnId: string) =>
    tasks.filter((t) => t.columnId === columnId).sort((a, b) => a.position - b.position);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading board...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-h">Kanban Board</h1>
          <p className="text-muted">Organize your tasks across columns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/tenant/${tenantId}`)}
            variant="outline"
            size="sm"
          >
            <Layout className="h-4 w-4 mr-2" />
            Back to tenant
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateColumn} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Column
          </Button>
          <Button onClick={handleCreateTask} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Task
          </Button>
        </div>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      {columns.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <p>No columns yet.</p>
          <Button onClick={handleCreateColumn} variant="outline" className="mt-4">
            Create your first column
          </Button>
        </div>
      )}

      {columns.length > 0 && (
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {columns.map((column) => (
            <div
              key={column._id}
              className="flex-1 min-w-[200px] flex flex-col gap-2"
              style={{
                minWidth: 220,
                maxWidth: 280,
                backgroundColor: '#f4f3ec',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-text-h">{column.name}</h3>
                <span className="text-xs text-muted">{getTasksForColumn(column._id).length}</span>
              </div>
              <div className="flex flex-col gap-2 min-h-[200px]">
                {getTasksForColumn(column._id).map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border border-input bg-background shadow-sm cursor-pointer group hover:border-accent/50 transition-colors"
                    onClick={() =>
                      navigate(`/board/${tenantId}/${boardId}/task/${task._id}/edit`)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            task.priority === 'HIGH'
                              ? 'bg-red-100 text-red-600'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="font-medium text-text-h truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted truncate">{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/board/${tenantId}/${boardId}/task/${task._id}/edit`);
                      }}
                      className="p-1.5 text-muted hover:text-accent transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {getTasksForColumn(column._id).length === 0 && (
                  <div className="text-[10px] text-muted italic mt-2">No tasks</div>
                )}
              </div>
            </div>
          ))}
          <div
            className="flex-1 min-w-[200px] flex flex-col gap-2"
            style={{
              minWidth: 220,
              maxWidth: 280,
              backgroundColor: '#f4f3ec',
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-text-h">Done</h3>
              <span className="text-xs text-muted">
                {tasks.filter((t) => !columns.some((c) => c._id === t.columnId)).length}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-h-[200px]">
              {tasks
                .filter((t) => !columns.some((c) => c._id === t.columnId))
                .map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border border-input bg-background shadow-sm cursor-pointer group hover:border-accent/50 transition-colors"
                    onClick={() =>
                      navigate(`/board/${tenantId}/${boardId}/task/${task._id}/edit`)
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            task.priority === 'HIGH'
                              ? 'bg-red-100 text-red-600'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="font-medium text-text-h truncate">{task.title}</h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/board/${tenantId}/${boardId}/task/${task._id}/edit`);
                      }}
                      className="p-1.5 text-muted hover:text-accent transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
