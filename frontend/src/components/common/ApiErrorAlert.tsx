import { AlertTriangle, X } from 'lucide-react';

interface ApiErrorAlertProps {
  message: string;
  statusCode?: number;
  onDismiss?: () => void;
}

export function ApiErrorAlert({ message, statusCode, onDismiss }: ApiErrorAlertProps) {
  return (
    <div className="animate-fade-in flex items-start gap-3 rounded-2xl border border-red-500/25 bg-gradient-to-br from-red-500/15 to-red-500/5 p-4 shadow-[0_8px_30px_-12px_rgba(239,68,68,0.4)]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm font-medium text-red-200">
          {statusCode ? <span className="mr-1 font-bold text-red-300">Error {statusCode}:</span> : null}
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-lg p-1.5 text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
