'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { User as UserIcon, Mail, Lock, ArrowLeft } from 'lucide-react';

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 p-2 rounded-md text-muted hover:bg-accent/10 hover:text-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-text-h">Profile</h1>
      </div>

      {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-h">Full name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<UserIcon className="h-4 w-4 text-muted" />}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-h">Avatar URL</label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.png"
              leftIcon={<Mail className="h-4 w-4 text-muted" />}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-h">Email</label>
          <Input
            value={user?.email || ''}
            disabled
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4 text-muted" />}
          />
          <p className="text-xs text-muted">Email cannot be changed from here.</p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <div className="border-t border-input pt-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-input bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition-colors"
        >
          <Lock className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
