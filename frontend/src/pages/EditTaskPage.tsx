'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { ArrowLeft } from 'lucide-react';
import type { Task } from '@/types';

export default function EditTaskPage() {
  const { tenantId, boardId, taskId } = useParams();
  const tId = tenantId!;
  const bId = boardId!;
  const tskId = taskId!;
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [task, setTask] = React.useState<Task | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState('MEDIUM');
  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    taskApi
      .getById(tskId)
      .then((res) => {
        const t = res.data.data.task;
        setTask(t);
        setTitle(t.title);
        setDescription(t.description);
        setPriority(t.priority);
        setVersion(t.version);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load task');
      });
  }, [tskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await taskApi.update(tskId, {
        title,
        description,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
        version,
      });
      navigate(`/board/${tId}/${bId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await taskApi.remove(tskId, version);
      navigate(`/board/${tId}/${bId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center text-muted">
        Loading task...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to={`/board/${tId}/${bId}`} className="flex items-center gap-2 p-2 rounded-md text-muted hover:bg-accent/10 hover:text-accent transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-text-h">Edit Task</h1>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-h">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            onClick={handleDelete}
            variant="destructive"
            disabled={loading}
          >
            Delete Task
          </Button>
          <Button type="submit" className="w-auto" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
