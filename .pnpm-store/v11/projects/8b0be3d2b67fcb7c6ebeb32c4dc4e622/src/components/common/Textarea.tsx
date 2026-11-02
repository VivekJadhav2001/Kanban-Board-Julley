import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'flex min-h-24 w-full resize-y rounded-xl border border-white/10 bg-[#0F0F1A]/80 px-3.5 py-3 text-sm text-slate-100 shadow-inner shadow-black/20',
            'placeholder:text-slate-500/80',
            'transition-all duration-200',
            'focus-visible:border-violet-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/60',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
