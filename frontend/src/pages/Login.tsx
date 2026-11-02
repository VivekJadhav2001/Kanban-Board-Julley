'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/authApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Mail, Lock, ArrowRight } from 'lucide-react';

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
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to Julley"
      description="Enter your credentials to continue to your workspaces."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-violet-400 transition-colors hover:text-violet-300">
            Create one
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <ApiErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
          required
        />
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
        <p className="text-[11px] leading-relaxed text-slate-500">
          New here? Create an account, then set up an organization, tenant, board, and columns to
          start planning.
        </p>
      </div>
    </AuthLayout>
  );
}
