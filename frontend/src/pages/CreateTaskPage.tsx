'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { columnApi } from '@/api/columnApi';
import { userApi } from '@/api/userApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { ListTodo, ArrowRight } from 'lucide-react';
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
  const [dueDate, setDueDate] = React.useState('');
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
        dueDate: dueDate || null,
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
    <FormPageLayout
      backTo={`/board/${tenantId}/${boardId}`}
      backLabel="Board"
      eyebrow="New task"
      title="Create task"
      description="Add a clear task with priority and an optional assignee."
      icon={<ListTodo className="h-5 w-5" />}
    >
      {error && (
        <div className="mb-5">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Design landing page"
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add context, acceptance criteria, or links"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Column"
            value={columnId}
            onChange={(e) => setColumnId(e.target.value)}
            required
          >
            <option value="">Select a column</option>
            {columns.map((column) => (
              <option key={column._id} value={column._id}>
                {column.name}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Select
            label="Assignee"
            value={assignedTo || ''}
            onChange={(e) => setAssignedTo(e.target.value || null)}
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </Select>
        </div>

        {columns.length === 0 && (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Create a column first before adding a task.
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading || !columnId}>
          {loading ? 'Creating...' : 'Create task'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>
    </FormPageLayout>
  );
}
