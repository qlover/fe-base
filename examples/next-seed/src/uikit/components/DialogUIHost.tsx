'use client';

import {
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import type { DialogHandlerOptions } from '@/impls/DialogHandler';
import { Button } from '@/uikit/components/Button';
import { Modal } from '@/uikit/components/Modal';
import { I } from '@config/ioc-identifiter';
import { useIOC } from '../hook/useIOC';

type ConfirmOptions = {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
};

/**
 * Bridges imperative DialogHandler confirm/toast to React UI.
 */
export function DialogUIHost() {
  const dialogHandler = useIOC(I.DialogHandler);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(
    null
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return dialogHandler.bindConfirmHost({
      open: (options: DialogHandlerOptions) => {
        setConfirmOptions({
          title: String(options.title ?? ''),
          content: options.content,
          okText: options.okText ?? 'OK',
          cancelText: options.cancelText ?? 'Cancel',
          variant: options.okType === 'danger' ? 'danger' : 'default',
          onConfirm: async () => {
            await options.onOk?.();
          }
        });
      }
    });
  }, [dialogHandler]);

  const closeConfirm = () => {
    if (pending) return;
    setConfirmOptions(null);
  };

  const handleConfirm = async () => {
    if (!confirmOptions || pending) return;
    setPending(true);
    try {
      await confirmOptions.onConfirm();
      setConfirmOptions(null);
    } catch {
      // Keep dialog open; caller shows toast via dialogHandler
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              'border border-primary-border bg-primary text-primary-text shadow-lg',
            title: 'text-primary-text',
            description: 'text-secondary-text'
          }
        }}
      />
      <Modal
        open={confirmOptions != null}
        title={confirmOptions?.title}
        onClose={closeConfirm}
        closeOnBackdrop={!pending}
        showFullscreenToggle={false}
        className="sm:max-w-md"
        footer={
          confirmOptions ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="secondary"
                disabled={pending}
                onClick={closeConfirm}
              >
                {confirmOptions.cancelText}
              </Button>
              <Button
                variant={
                  confirmOptions.variant === 'danger' ? 'danger' : 'primary'
                }
                disabled={pending}
                onClick={() => void handleConfirm()}
              >
                {pending && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                {confirmOptions.okText}
              </Button>
            </div>
          ) : undefined
        }
      >
        {confirmOptions ? (
          <p className="flex gap-2 text-sm leading-relaxed text-secondary-text">
            <ExclamationCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
            <span>{confirmOptions.content}</span>
          </p>
        ) : null}
      </Modal>
    </>
  );
}
