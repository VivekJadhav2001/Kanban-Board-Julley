'use client';

import * as React from 'react';
import {
  History,
  PlusCircle,
  Pencil,
  Trash2,
  MoveRight,
  UserCheck,
  ArrowUpDown,
  MessageSquare,
  RefreshCw,
  Inbox,
  type LucideIcon,
} from 'lucide-react';
import { activityApi } from '@/api/activityApi';
import { SidePanel } from '@/components/common/SidePanel';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import type { ActivityAction, ActivityLog } from '@/types';

interface ActivityPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  boardId?: string;
  tenantId?: string;
}

const actionMeta: Record<
  ActivityAction,
  { icon: LucideIcon; label: string; tone: string }
> = {
  CREATE: {
    icon: PlusCircle,
    label: 'created',
    tone: 'border-emerald-500/25 bg-emerald-500/15 text-emerald-300',
  },
  UPDATE: {
    icon: Pencil,
    label: 'updated',
    tone: 'border-sky-500/25 bg-sky-500/15 text-sky-300',
  },
  DELETE: {
    icon: Trash2,
    label: 'deleted',
    tone: 'border-red-500/25 bg-red-500/15 text-red-300',
  },
  MOVE: {
    icon: MoveRight,
    label: 'moved',
    tone: 'border-violet-500/25 bg-violet-500/15 text-violet-300',
  },
  ASSIGN: {
    icon: UserCheck,
    label: 'reassigned',
    tone: 'border-amber-500/25 bg-amber-500/15 text-amber-300',
  },
  REORDER: {
    icon: ArrowUpDown,
    label: 'reordered',
    tone: 'border-slate-500/25 bg-slate-500/15 text-slate-300',
  },
  COMMENT: {
    icon: MessageSquare,
    label: 'commented on',
    tone: 'border-sky-500/25 bg-sky-500/15 text-sky-300',
  },
};

function timeAgo(value?: string) {
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
  }).format(new Date(value));
}

function describe(activity: ActivityLog) {
  const details = activity.details as {
    title?: string;
    comment?: string;
    after?: { title?: string };
    deletedTask?: { title?: string };
  };

  const title =
    details.title || details.after?.title || details.deletedTask?.title || null;

  if (activity.action === 'MOVE') return 'a task';
  if (activity.action === 'REORDER') return 'task order';
  if (activity.action === 'ASSIGN') return 'an assignee';
  if (activity.action === 'COMMENT' && title) return `"${title}"`;
  return title ? `"${title}"` : 'a task';
}

export function ActivityPanel({
  open,
  onClose,
  title,
  description,
  boardId,
  tenantId,
}: ActivityPanelProps) {
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    if (!boardId && !tenantId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = boardId
      ? activityApi.listForBoard(boardId)
      : activityApi.listForTenant(tenantId!, { limit: 50 });

    request
      .then((response) => {
        if (!cancelled) setActivities(response.data.data.activities);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load activity.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, boardId, tenantId, refreshKey]);

  const comment = (activity: ActivityLog) => {
    const details = activity.details as { comment?: string };
    return activity.action === 'COMMENT' && details.comment ? details.comment : null;
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={<History className="h-5 w-5" />}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {loading ? 'Loading...' : `${activities.length} events`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey((key) => key + 1)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {loading && activities.length === 0 ? (
        <div className="py-20">
          <Spinner label="Loading activity..." />
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-500">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="mt-4 text-sm font-semibold text-white">No activity yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Task changes and comments will appear here.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-1">
          <div className="absolute bottom-2 left-[19px] top-2 w-px bg-gradient-to-b from-violet-500/30 via-white/10 to-transparent" />
          {activities.map((activity) => {
            const meta = actionMeta[activity.action] ?? actionMeta.UPDATE;
            const Icon = meta.icon;
            const actor =
              typeof activity.userId === 'string' ? null : activity.userId;
            const initials = (actor?.name || '?')
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <li key={activity._id} className="relative flex gap-3 py-2.5">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm leading-relaxed text-slate-300">
                    <span className="font-semibold text-white">
                      {actor?.name || 'Someone'}
                    </span>{' '}
                    {meta.label} {describe(activity)}
                  </p>
                  {comment(activity) && (
                    <p className="mt-1 line-clamp-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs italic text-slate-400">
                      “{comment(activity)}”
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-[9px] font-semibold text-slate-400"
                      aria-hidden="true"
                    >
                      {initials}
                    </span>
                    <time dateTime={activity.createdAt}>{timeAgo(activity.createdAt)}</time>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SidePanel>
  );
}
