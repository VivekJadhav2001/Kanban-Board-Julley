import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="group relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-violet-400">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-11 w-full rounded-xl border border-white/10 bg-[#0F0F1A]/80 px-3.5 py-2 text-sm text-slate-100 shadow-inner shadow-black/20',
              'placeholder:text-slate-500/80',
              'transition-all duration-200',
              'focus-visible:border-violet-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-11',
              error && 'border-red-500/60 focus-visible:border-red-500 focus-visible:ring-red-500/30',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
