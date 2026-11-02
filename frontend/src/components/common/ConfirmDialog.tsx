'use client';

import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={(value) => !value && !loading && onClose()}>
      <div className="flex flex-col items-center pt-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/25 bg-red-500/15 text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p>
        {error && (
          <div className="mt-4 w-full text-left">
            <ApiErrorAlert message={error} />
          </div>
        )}
        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
