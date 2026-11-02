import * as React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, glow = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl',
        glow && 'shadow-[0_0_40px_-8px_rgba(124,58,237,0.45)]',
        interactive &&
          'cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_16px_48px_-12px_rgba(124,58,237,0.45)]',
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  )
);

Card.displayName = 'Card';
