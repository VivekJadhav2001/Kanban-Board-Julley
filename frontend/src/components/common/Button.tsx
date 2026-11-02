import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'accent' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default:
        'bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:from-violet-500 hover:to-violet-600 hover:shadow-[0_0_30px_rgba(124,58,237,0.55)]',
      accent:
        'bg-gradient-to-br from-yellow-400 to-yellow-500 text-[#0A0A0F] shadow-[0_0_20px_rgba(250,204,21,0.35)] hover:from-yellow-300 hover:to-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.55)]',
      destructive:
        'bg-red-500/90 text-white shadow-[0_0_18px_rgba(239,68,68,0.25)] hover:bg-red-500',
      outline:
        'border border-white/10 bg-white/[0.03] text-slate-200 backdrop-blur hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white',
      secondary:
        'bg-white/[0.06] text-slate-100 border border-white/5 hover:bg-white/[0.1]',
      ghost:
        'text-slate-300 hover:bg-violet-500/10 hover:text-white',
      link: 'text-violet-400 underline-offset-4 hover:text-violet-300 hover:underline',
    };

    const sizes = {
      default: 'h-10 px-4 text-sm',
      sm: 'h-9 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(
          'group inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0F]',
          'disabled:pointer-events-none disabled:opacity-45',
          'active:scale-[0.97]',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
