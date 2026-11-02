import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-5 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-6 lg:flex-row lg:items-center lg:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-[0_0_24px_-4px_rgba(124,58,237,0.6)]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-400">
              {eyebrow}
            </p>
          )}
          <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 max-sm:[&>button]:flex-1">{actions}</div>}
    </header>
  );
}
