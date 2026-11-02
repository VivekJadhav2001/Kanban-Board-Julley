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
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => onOpenChange(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-full max-w-lg p-6 bg-background border border-input rounded-lg shadow-lg">
          {title && <h2 className="text-lg font-semibold text-text-h">{title}</h2>}
          {description && <p className="text-sm text-muted">{description}</p>}
          <div className="mt-4">{children}</div>
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
