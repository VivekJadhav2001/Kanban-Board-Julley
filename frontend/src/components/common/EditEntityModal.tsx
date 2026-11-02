'use client';

import * as React from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';

export interface EntityField {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  lowercase?: boolean;
  maxLength?: number;
}

interface EditEntityModalProps {
  open: boolean;
  title: string;
  description?: string;
  fields: EntityField[];
  initialValues: Record<string, string>;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}

interface EntityFormProps
  extends Omit<EditEntityModalProps, 'open' | 'title' | 'description'> {}

function EntityForm({
  fields,
  initialValues,
  submitLabel = 'Save changes',
  loading = false,
  error,
  onSubmit,
  onClose,
}: EntityFormProps) {
  const [values, setValues] = React.useState<Record<string, string>>(initialValues);

  const handleChange = (field: EntityField, value: string) => {
    setValues((current) => ({
      ...current,
      [field.name]: field.lowercase ? value.toLowerCase().replace(/\s+/g, '-') : value,
    }));
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
      className="space-y-4"
    >
      {error && <ApiErrorAlert message={error} />}
      {fields.map((field) =>
        field.textarea ? (
          <Textarea
            key={field.name}
            label={field.label}
            value={values[field.name] || ''}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
            onChange={(event) => handleChange(field, event.target.value)}
          />
        ) : (
          <Input
            key={field.name}
            label={field.label}
            value={values[field.name] || ''}
            placeholder={field.placeholder}
            required={field.required}
            maxLength={field.maxLength}
            onChange={(event) => handleChange(field, event.target.value)}
          />
        )
      )}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export function EditEntityModal({ open, ...props }: EditEntityModalProps) {
  if (!open) return null;

  return (
    <Modal open onOpenChange={(value) => !value && !props.loading && props.onClose()} title={props.title} description={props.description}>
      <EntityForm {...props} />
    </Modal>
  );
}
