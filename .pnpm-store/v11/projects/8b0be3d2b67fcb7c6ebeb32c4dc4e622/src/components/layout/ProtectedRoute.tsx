'use client';

import * as React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthUser, useAuthLoading } from '@/store/authStore';
import { Spinner } from '@/components/common/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthUser();
  const loading = useAuthLoading();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0F]">
        <Spinner label="Restoring your session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const membership = useAuthUser();
  const loading = useAuthLoading();

  if (loading) {
    return null;
  }

  const userRole = (membership as any)?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
