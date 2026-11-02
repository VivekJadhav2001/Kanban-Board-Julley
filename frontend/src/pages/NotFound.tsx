import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-transparent px-6 py-16 text-center shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/15 text-violet-300 shadow-[0_0_30px_-6px_rgba(124,58,237,0.8)]">
            <Compass className="h-7 w-7" />
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-violet-400">
            404 — Off the board
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Page not found</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            This route does not exist, or the item was moved. Head back to your dashboard to keep
            things moving.
          </p>
          <Link
            to="/dashboard"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(124,58,237,0.8)] transition-all hover:from-violet-500 hover:to-violet-600 active:scale-[0.97]"
          >
            <Home className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
