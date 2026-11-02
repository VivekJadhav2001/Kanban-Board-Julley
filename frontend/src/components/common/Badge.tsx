import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'accent' | 'success' | 'warning' | 'muted';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'border-violet-500/30 bg-violet-500/15 text-violet-300',
      secondary: 'border-white/10 bg-white/[0.06] text-slate-300',
      destructive: 'border-red-500/30 bg-red-500/15 text-red-300',
      outline: 'border-white/15 bg-transparent text-slate-300',
      accent: 'border-yellow-400/30 bg-yellow-400/15 text-yellow-300',
      success: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
      warning: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
      muted: 'border-white/5 bg-white/[0.03] text-slate-400',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
