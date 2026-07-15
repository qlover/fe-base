'use client';

import {
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import {
  oauthDangerButtonClass,
  oauthPrimaryButtonClass,
  oauthSecondaryButtonClass
} from '@config/component';
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
      // Keep dialog open; caller shows toast via message.*
    } finally {
      setPending(false);
    }
  };

  if (!options) return null;

  const okClass =
    options.variant === 'danger'
      ? oauthDangerButtonClass
      : oauthPrimaryButtonClass;

  return (
    <DeveloperOverlayModal
      open={open}
      title={options.title}
      onClose={onClose}
      maxWidthClass="max-w-md"
      closeOnBackdrop={!pending}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className={oauthSecondaryButtonClass}
            disabled={pending}
            onClick={onClose}
          >
            {options.cancelText}
          </button>
          <button
            type="button"
            className={okClass}
            disabled={pending}
            onClick={() => void handleConfirm()}
          >
            {pending && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
            {options.okText}
          </button>
        </div>
      }
    >
      <p className="text-sm text-secondary-text leading-relaxed flex gap-2">
        <ExclamationCircleIcon className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
        <span>{options.content}</span>
      </p>
    </DeveloperOverlayModal>
  );
}
