'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { PageHeader } from '@/components/common/PageHeader';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { User as UserIcon, Mail, Image, LogOut, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [name, setName] = React.useState(user?.name || '');
  const [avatar, setAvatar] = React.useState(user?.avatar || '');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.updateProfile({ name, avatar });
      const updatedUser = res.data.data.user;
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      // Update store
      const store = useAuthStore.getState();
      store.setUser(updatedUser);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage how you show up across your workspaces."
        icon={<UserIcon className="h-5 w-5" />}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        }
      />

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit p-6" glow>
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-full bg-violet-600/25 blur-2xl" />
              <Avatar name={user?.name} src={user?.avatar} size="xl" className="relative" />
            </div>
            <h2 className="mt-5 truncate text-lg font-bold text-white">{user?.name || 'Member'}</h2>
            <p className="mt-0.5 truncate text-sm text-slate-400">{user?.email}</p>
            <div className="mt-4">
              <Badge variant="success">
                <ShieldCheck className="h-3 w-3" />
                Authenticated
              </Badge>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Member since</span>
              <span className="font-medium text-slate-300">
                {user?.createdAt
                  ? new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(
                      new Date(user.createdAt)
                    )
                  : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Account status</span>
              <span className="font-medium text-emerald-300">Active</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/[0.07] p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              Profile tip
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Add an avatar URL so teammates can recognize you across boards.
            </p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 sm:p-7">
            <h3 className="text-base font-semibold text-white">Personal details</h3>
            <p className="mt-0.5 text-sm text-slate-500">
              Update your display name and avatar.
            </p>

            <form onSubmit={handleUpdate} className="mt-6 space-y-5">
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                leftIcon={<UserIcon className="h-4 w-4" />}
              />
              <Input
                label="Avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.png"
                leftIcon={<Image className="h-4 w-4" />}
              />
              <Input
                label="Email address"
                value={user?.email || ''}
                disabled
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
              />
              <p className="-mt-2 text-xs text-slate-500">Email cannot be changed from here.</p>

              <div className="flex justify-end border-t border-white/[0.06] pt-5">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-red-500/15 p-6 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Session</h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Sign out of this device. You can sign back in any time.
                </p>
              </div>
              <Button variant="destructive" onClick={handleLogout} className="sm:w-auto">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
