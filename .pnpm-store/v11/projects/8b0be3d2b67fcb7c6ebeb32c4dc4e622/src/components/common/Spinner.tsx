import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center gap-3 text-sm text-slate-400', className)}>
      <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
      {label && <span>{label}</span>}
    </div>
  );
}
