import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'flex h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0F0F1A]/80 px-3.5 py-2 pr-10 text-sm text-slate-100',
              'transition-all duration-200',
              'focus-visible:border-violet-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-red-500/60',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>
        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
