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
        'flex flex-col gap-5 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-transparent p-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:gap-6 sm:p-6 lg:flex-row lg:items-center lg:justify-between',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-[0_0_24px_-4px_rgba(124,58,237,0.6)] sm:h-12 sm:w-12">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-400">
              {eyebrow}
            </p>
          )}
          <h1 className="break-words text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end max-sm:[&>*]:min-w-[calc(50%_-_0.25rem)] max-sm:[&>*]:flex-1">
          {actions}
        </div>
      )}
    </header>
  );
}
