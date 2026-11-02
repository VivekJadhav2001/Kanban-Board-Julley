import * as React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const previewColumns = [
  {
    title: 'Backlog',
    accent: 'from-violet-500 to-violet-700',
    cards: [
      { title: 'Customer interviews', tag: 'Research', tone: 'text-violet-300 bg-violet-500/15' },
      { title: 'Pricing exploration', tag: 'Strategy', tone: 'text-yellow-300 bg-yellow-400/15' },
    ],
  },
  {
    title: 'In progress',
    accent: 'from-yellow-400 to-amber-500',
    cards: [
      { title: 'Onboarding flow', tag: 'Design', tone: 'text-yellow-300 bg-yellow-400/15' },
    ],
  },
  {
    title: 'Shipped',
    accent: 'from-emerald-400 to-emerald-600',
    cards: [
      { title: 'Realtime sync', tag: 'Done', tone: 'text-emerald-300 bg-emerald-500/15' },
      { title: 'Team invites', tag: 'Done', tone: 'text-emerald-300 bg-emerald-500/15' },
    ],
  },
];

export function AuthLayout({ eyebrow, title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0F]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-[460px] w-[460px] rounded-full bg-violet-600/25 blur-[150px]" />
        <div className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 py-10 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div className="hidden lg:block">
          <Link to="/login" className="inline-flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_0_30px_-6px_rgba(124,58,237,0.9)]">
              <Building2 className="h-5 w-5 text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#0A0A0F] bg-yellow-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Julley</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                Kanban Studio
              </p>
            </div>
          </Link>

          <h2 className="mt-10 text-4xl font-bold leading-[1.1] tracking-tight text-white">
            Turn ambitious plans into
            <span className="gradient-text-primary"> visible progress.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            A focused workspace for multi-tenant teams. Organize boards, move work forward, and
            keep every member in sync in real time.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-3">
            {previewColumns.map((column) => (
              <div
                key={column.title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${column.accent}`} />
                  <span className="text-[11px] font-semibold text-slate-300">{column.title}</span>
                </div>
                <div className="space-y-2">
                  {column.cards.map((card) => (
                    <div
                      key={card.title}
                      className="rounded-xl border border-white/[0.06] bg-[#0F0F1A]/80 p-2.5 shadow-sm"
                    >
                      <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${card.tone}`}>
                        {card.tag}
                      </span>
                      <p className="mt-1.5 text-[11px] font-medium leading-snug text-slate-200">
                        {card.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {['Realtime updates', 'Multi-tenant ready', 'Drag & drop'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Link to="/login" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-[0_0_30px_-6px_rgba(124,58,237,0.9)]">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">Julley</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-400">
                Kanban Studio
              </p>
            </div>
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.8),0_0_60px_-24px_rgba(124,58,237,0.6)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
            <div className="mb-6">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-400">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">{title}</h1>
              <p className="mt-1.5 text-sm text-slate-400">{description}</p>
            </div>
            {children}
          </div>

          <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>

          <p className="mt-8 flex items-center justify-center gap-1 text-[11px] text-slate-600">
            Secure workspace
            <ArrowRight className="h-3 w-3" />
            Your data stays scoped to your tenant
          </p>
        </div>
      </div>
    </div>
  );
}
