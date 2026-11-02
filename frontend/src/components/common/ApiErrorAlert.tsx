import { X } from 'lucide-react';

interface ApiErrorAlertProps {
  message: string;
  statusCode?: number;
  onDismiss?: () => void;
}

export function ApiErrorAlert({ message, statusCode, onDismiss }: ApiErrorAlertProps) {
  return (
    <div className="rounded-md border border-red-500/50 bg-red-500/10 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center rounded-md bg-red-500 p-2">
            <X className="h-5 w-5 text-white" />
          </span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-red-500">
            {statusCode ? `Error ${statusCode}: ` : ''}{message}
          </p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-red-500 hover:bg-red-500/10"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
