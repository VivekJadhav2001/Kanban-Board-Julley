'use client';

import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg animate-scale-in overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F1A]/95 p-6 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.8),0_0_60px_-20px_rgba(124,58,237,0.6)] backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          {title && <h2 className="pr-8 text-lg font-semibold text-white">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </>
  );
}
