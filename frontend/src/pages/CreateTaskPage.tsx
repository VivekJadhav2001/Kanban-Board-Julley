'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { columnApi } from '@/api/columnApi';
import { userApi } from '@/api/userApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { ArrowLeft } from 'lucide-react';
import type { User } from '@/types';
import type { Column } from '@/types';

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { tenantId, boardId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [columnId, setColumnId] = React.useState('');
  const [priority, setPriority] = React.useState('MEDIUM');
  const [assignedTo, setAssignedTo] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState<User[]>([]);
  const [columns, setColumns] = React.useState<Column[]>([]);

  React.useEffect(() => {
    if (!tenantId) return;
    userApi
      .list({ tenantId })
      .then((res) => {
        setUsers(res.data.data.users);
      })
      .catch(() => {});
  }, [tenantId]);

  React.useEffect(() => {
    if (!boardId) return;
    columnApi
      .list(boardId)
      .then((res) => {
        const availableColumns = res.data.data.columns;
        setColumns(availableColumns);
        setColumnId((current) => current || availableColumns[0]?._id || '');
      })
      .catch((err: any) => setError(err.message || 'Failed to load columns'));
  }, [boardId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!boardId) return;
      await taskApi.create(boardId, {
        title,
        description,
        columnId,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
        assignedTo: assignedTo || null,
      });
      navigate(`/board/${tenantId}/${boardId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/board/${tenantId}/${boardId}`} className="flex items-center gap-2 p-2 rounded-md text-muted hover:bg-accent/10 hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-text-h">Create Task</h1>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Design landing page"
          required
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this task"
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-h">Column</label>
          <select
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a column</option>
            {columns.map((column) => (
              <option key={column._id} value={column._id}>{column.name}</option>
            ))}
          </select>
          {columns.length === 0 && <p className="text-xs text-muted">Create a column before adding a task.</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-h">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-h">Assignee</label>
          <select
            value={assignedTo || ''}
            onChange={(e) => setAssignedTo(e.target.value || null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={loading || !columnId}>
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </form>
    </div>
  );
}
