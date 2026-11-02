'use client';

import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '@/api/taskApi';
import { commentApi } from '@/api/commentApi';
import { userApi } from '@/api/userApi';
import { useAuthUser } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { FormPageLayout } from '@/components/common/FormPageLayout';
import { ListTodo, Save, Trash2, MessageSquare, Send } from 'lucide-react';
import type { Comment, Task, User } from '@/types';

function relativeTime(value?: string) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function commentAuthor(comment: Comment) {
  return typeof comment.userId === 'string' ? null : comment.userId;
}

function authorInitials(name?: string) {
  return (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function EditTaskPage() {
  const { tenantId, boardId, taskId } = useParams();
  const tId = tenantId!;
  const bId = boardId!;
  const tskId = taskId!;
  const navigate = useNavigate();
  const currentUser = useAuthUser();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [task, setTask] = React.useState<Task | null>(null);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState('MEDIUM');
  const [dueDate, setDueDate] = React.useState('');
  const [assignedTo, setAssignedTo] = React.useState('');
  const [users, setUsers] = React.useState<User[]>([]);
  const [version, setVersion] = React.useState(0);

  const [comments, setComments] = React.useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = React.useState(false);
  const [commentBody, setCommentBody] = React.useState('');
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const [commentSubmitting, setCommentSubmitting] = React.useState(false);
  const [deletingCommentId, setDeletingCommentId] = React.useState<string | null>(null);

  React.useEffect(() => {
    taskApi
      .getById(tskId)
      .then((res) => {
        const t = res.data.data.task;
        setTask(t);
        setTitle(t.title);
        setDescription(t.description);
        setPriority(t.priority);
        setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
        setAssignedTo(
          typeof t.assignedTo === 'string' ? t.assignedTo : t.assignedTo?._id || ''
        );
        setVersion(t.version);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load task');
      });
  }, [tskId]);

  React.useEffect(() => {
    if (!tenantId) return;
    userApi
      .list({ tenantId })
      .then((res) => setUsers(res.data.data.users))
      .catch(() => {});
  }, [tenantId]);

  const loadComments = React.useCallback(async () => {
    setCommentsLoading(true);
    setCommentError(null);
    try {
      const response = await commentApi.list(tskId);
      setComments(response.data.data.comments);
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  }, [tskId]);

  React.useEffect(() => {
    void loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await taskApi.update(tskId, {
        title,
        description,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
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

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = commentBody.trim();
    if (!body) return;

    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const response = await commentApi.create(tskId, body);
      setComments((current) => [...current, response.data.data.comment]);
      setCommentBody('');
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!window.confirm('Delete this comment?')) return;

    setDeletingCommentId(comment._id);
    setCommentError(null);
    try {
      await commentApi.remove(tskId, comment._id);
      setComments((current) => current.filter((item) => item._id !== comment._id));
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Failed to delete comment.');
    } finally {
      setDeletingCommentId(null);
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
        <>
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

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </Select>

              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <Select
              label="Assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
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

          <section className="mt-8 border-t border-white/[0.08] pt-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <MessageSquare className="h-4 w-4 text-violet-300" />
                Comments
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-slate-400">
                  {comments.length}
                </span>
              </h2>
            </div>

            {commentError && (
              <div className="mt-4">
                <ApiErrorAlert message={commentError} onDismiss={() => setCommentError(null)} />
              </div>
            )}

            <form onSubmit={handleAddComment} className="mt-4 space-y-2">
              <Textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                placeholder="Write a comment or share an update..."
                maxLength={2000}
                rows={3}
                aria-label="New comment"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  {commentBody.length}/2000
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={commentSubmitting || !commentBody.trim()}
                >
                  {commentSubmitting ? 'Posting...' : 'Post comment'}
                  {!commentSubmitting && <Send className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </form>

            {commentsLoading ? (
              <div className="py-10">
                <Spinner label="Loading comments..." />
              </div>
            ) : comments.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-slate-500">
                No comments yet. Start the conversation.
              </div>
            ) : (
              <ul className="mt-5 space-y-4">
                {comments.map((comment) => {
                  const author = commentAuthor(comment);
                  const canDelete =
                    author?._id === currentUser?._id ||
                    (typeof comment.userId === 'string' &&
                      comment.userId === currentUser?._id);

                  return (
                    <li key={comment._id} className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/15 text-[10px] font-bold text-violet-200">
                        {authorInitials(author?.name || currentUser?.name)}
                      </div>
                      <div className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="min-w-0 truncate text-xs font-semibold text-white">
                            {author?.name || 'Unknown user'}
                            <span className="ml-2 font-normal text-slate-500">
                              {relativeTime(comment.createdAt)}
                            </span>
                          </p>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void handleDeleteComment(comment)}
                              disabled={deletingCommentId === comment._id}
                              className="rounded-md p-1 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
                          {comment.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </FormPageLayout>
  );
}
