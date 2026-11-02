'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLocalLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setError(null);
    setLocalLoading(true);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      const { token, data } = res.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      login(token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent text-white mb-4">
            <UserIcon className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-text-h">Welcome back</h2>
          <p className="text-muted mt-2">Sign in to your Julley account</p>
        </div>

        {error && <ApiErrorAlert message={error} onDismiss={() => setError(null)} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4 text-muted" />}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4 text-muted" />}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
