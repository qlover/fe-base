'use client';

import {
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Button } from '@/uikit/components/Button';
import { DeveloperOverlayModal } from './DeveloperOverlayModal';

export type DeveloperConfirmOptions = {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
};

type DeveloperConfirmDialogProps = {
  open: boolean;
  options: DeveloperConfirmOptions | null;
  onClose: () => void;
};

export function DeveloperConfirmDialog({
  open,
  options,
  onClose
}: DeveloperConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    if (!options || pending) return;
    setPending(true);
    try {
      await options.onConfirm();
      onClose();
    } catch {
      // Keep dialog open; caller shows toast via dialogHandler
    } finally {
      setPending(false);
    }
  };

  if (!options) return null;

  return (
    <DeveloperOverlayModal
      open={open}
      title={options.title}
      onClose={onClose}
      maxWidthClass="sm:max-w-md"
      closeOnBackdrop={!pending}
      showFullscreenToggle={false}
      bodyClassName="px-4 py-3 sm:px-5 sm:py-3.5"
      footerClassName="!px-4 !py-3 sm:!px-5 sm:!py-3.5"
      headerClassName="!px-4 !py-3 sm:!px-5 sm:!py-3.5"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={pending} onClick={onClose}>
            {options.cancelText}
          </Button>
          <Button
            variant={options.variant === 'danger' ? 'danger' : 'primary'}
            disabled={pending}
            onClick={() => void handleConfirm()}
          >
            {pending && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
            {options.okText}
          </Button>
        </div>
      }
    >
      <p className="flex gap-2 text-sm leading-relaxed text-secondary-text">
        <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
        <span>{options.content}</span>
      </p>
    </DeveloperOverlayModal>
  );
}
