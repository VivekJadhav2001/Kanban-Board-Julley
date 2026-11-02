'use client';

import * as React from 'react';
import { Users, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { membershipApi } from '@/api/membershipApi';
import { useAuthUser } from '@/store/authStore';
import { SidePanel } from '@/components/common/SidePanel';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Spinner } from '@/components/common/Spinner';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import type { PopulatedMembership, Role } from '@/types';

interface MembersPanelProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  tenantId?: string;
  title?: string;
}

const roleLabels: Record<Role, string> = {
  ORG_ADMIN: 'Organization owner',
  TENANT_ADMIN: 'Tenant admin',
  MEMBER: 'Member',
};

function initials(name?: string) {
  return (name || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function MembersPanel({
  open,
  onClose,
  organizationId,
  tenantId,
  title,
}: MembersPanelProps) {
  const currentUser = useAuthUser();
  const [members, setMembers] = React.useState<PopulatedMembership[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'TENANT_ADMIN' | 'MEMBER'>('MEMBER');
  const [submitting, setSubmitting] = React.useState(false);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = tenantId
      ? membershipApi.listForTenant(tenantId)
      : membershipApi.listForOrganization(organizationId);

    request
      .then((response) => {
        if (!cancelled) setMembers(response.data.data.memberships);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load members.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, organizationId, tenantId, refreshKey]);

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      await membershipApi.add(organizationId, {
        email: email.trim(),
        role,
        tenantId: tenantId || null,
      });
      setEmail('');
      setNotice('Member added successfully.');
      setRefreshKey((key) => key + 1);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (membershipId: string, nextRole: Role) => {
    setUpdatingId(membershipId);
    setFormError(null);
    setNotice(null);

    try {
      await membershipApi.updateRole(membershipId, nextRole);
      setMembers((current) =>
        current.map((member) =>
          member._id === membershipId ? { ...member, role: nextRole } : member
        )
      );
      setNotice('Member role updated.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (member: PopulatedMembership) => {
    if (!window.confirm(`Remove ${member.userId.name} from this workspace?`)) return;

    setRemovingId(member._id);
    setFormError(null);
    setNotice(null);

    try {
      await membershipApi.remove(member._id);
      setMembers((current) => current.filter((item) => item._id !== member._id));
      setNotice('Member removed.');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Could not remove member.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={title || 'Members'}
      description={
        tenantId
          ? 'Invite teammates to this tenant and manage their roles.'
          : 'Everyone with access to this organization.'
      }
      icon={<Users className="h-5 w-5" />}
      size="lg"
      footer={
        <span className="text-xs text-slate-500">
          {loading
            ? 'Loading...'
            : `${members.length} active ${members.length === 1 ? 'member' : 'members'}`}
        </span>
      }
    >
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <UserPlus className="h-4 w-4 text-violet-300" />
          Add a member
        </div>
        <p className="mt-1 text-xs text-slate-500">
          They need an existing account. Enter the email they registered with.
        </p>

        <div className="mt-4 space-y-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teammate@example.com"
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as 'TENANT_ADMIN' | 'MEMBER')
            }
            disabled={!tenantId}
            hint={!tenantId ? 'Organization-wide members join as members.' : undefined}
          >
            {tenantId && <option value="TENANT_ADMIN">Tenant admin</option>}
            <option value="MEMBER">Member</option>
          </Select>
          <Button type="submit" className="w-full" disabled={submitting || !email.trim()}>
            {submitting ? 'Adding...' : 'Add member'}
          </Button>
        </div>
      </form>

      {formError && (
        <div className="mt-4">
          <ApiErrorAlert message={formError} onDismiss={() => setFormError(null)} />
        </div>
      )}
      {notice && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-medium text-emerald-200">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}
      {error && (
        <div className="mt-4">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          People
        </h3>

        {loading && members.length === 0 ? (
          <div className="py-16">
            <Spinner label="Loading members..." />
          </div>
        ) : members.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
            <p className="text-sm font-semibold text-white">No members yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Add a teammate using the form above.
            </p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {members.map((member) => {
              const isSelf = member.userId._id === currentUser?._id;
              const isTenantMembership = Boolean(member.tenantId);
              const canChangeRole = member.role !== 'ORG_ADMIN';
              const isBusy =
                updatingId === member._id || removingId === member._id;

              return (
                <li key={member._id} className="flex items-center gap-3 py-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/15 text-xs font-bold text-violet-200">
                    {initials(member.userId.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {member.userId.name}
                      {isSelf && (
                        <span className="ml-2 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                          You
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500">{member.userId.email}</p>
                    {!tenantId && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {member.tenantId ? member.tenantId.name : 'Organization-wide'}
                      </p>
                    )}
                  </div>

                  {tenantId || isTenantMembership ? (
                    canChangeRole ? (
                      <select
                        value={member.role}
                        onChange={(event) =>
                          void handleRoleChange(
                            member._id,
                            event.target.value as Role
                          )
                        }
                        disabled={isBusy}
                        aria-label={`Role for ${member.userId.name}`}
                        className="h-8 rounded-lg border border-white/10 bg-[#0F0F1A]/80 px-2 text-[11px] font-medium text-slate-200 focus-visible:border-violet-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:opacity-50"
                      >
                        <option value="TENANT_ADMIN">Tenant admin</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    ) : (
                      <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-slate-400">
                        {roleLabels[member.role]}
                      </span>
                    )
                  ) : (
                    <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-slate-400">
                      {roleLabels[member.role]}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleRemove(member)}
                    disabled={isSelf || isBusy}
                    title={isSelf ? 'You cannot remove yourself' : 'Remove member'}
                    className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Remove ${member.userId.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </SidePanel>
  );
}
