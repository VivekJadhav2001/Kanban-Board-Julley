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
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, setLoading } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLocalLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setError(null);
    setLocalLoading(true);
    setLoading(true);

    try {
      const res = await authApi.register({ name, email, password });
      const { token, data } = res.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      login(token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Create your account"
      description="Join Julley and give your team a calmer way to ship work."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-violet-400 transition-colors hover:text-violet-300">
            Sign in
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
          label="Full name"
          type="text"
          name="name"
          placeholder="John Doe"
          leftIcon={<UserIcon className="h-4 w-4" />}
          autoComplete="name"
          required
        />
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
          placeholder="Minimum 8 characters"
          leftIcon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          required
        />
        <Button type="submit" variant="accent" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-slate-500">
        By creating an account you agree to keep your workspace secure and your teammates
        respected.
      </p>
    </AuthLayout>
  );
}
