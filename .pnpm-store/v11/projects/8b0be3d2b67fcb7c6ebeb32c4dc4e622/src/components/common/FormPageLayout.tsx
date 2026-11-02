import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Badge } from './Badge';

interface FormPageLayoutProps {
  backTo: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function FormPageLayout({
  backTo,
  backLabel,
  eyebrow,
  title,
  description,
  icon,
  children,
}: FormPageLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={backTo}
          className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-violet-500/40 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </Link>
        <Badge variant="secondary">{eyebrow}</Badge>
      </div>

      <div className="relative isolate overflow-hidden rounded-3xl border border-violet-400/15 bg-[#11111d]/95 p-5 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.035] backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative mb-7 flex items-start gap-4 border-b border-white/10 pb-6">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-[0_0_24px_-6px_rgba(124,58,237,0.8)]">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            {description && <p className="mt-1 max-w-xl text-sm leading-6 text-slate-300">{description}</p>}
          </div>
        </div>

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
