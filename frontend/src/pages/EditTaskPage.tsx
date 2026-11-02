'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { ListTodo, Save, Trash2 } from 'lucide-react';
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

  return (
    <FormPageLayout
      backTo={`/board/${tId}/${bId}`}
      backLabel="Board"
      eyebrow="Edit task"
      title="Update task"
      description="Refine the details, adjust priority, or remove this task."
      icon={<ListTodo className="h-5 w-5" />}
    >
      {error && (
        <div className="mb-5">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {!task ? (
        <div className="py-16">
          <Spinner label="Loading task..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Task details
            </p>
            <Badge variant="secondary">v{version}</Badge>
          </div>

          <Input
            label="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, acceptance criteria, or links"
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={handleDelete}
              variant="destructive"
              disabled={loading}
              className="sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete task
            </Button>
            <Button type="submit" disabled={loading} className="sm:w-auto">
              {loading ? 'Saving...' : 'Save changes'}
              {!loading && <Save className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      )}
    </FormPageLayout>
  );
}
