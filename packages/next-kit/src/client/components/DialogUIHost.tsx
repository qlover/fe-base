'use client';

import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import type { DialogHandler, DialogHandlerOptions } from '../DialogHandler';
import { Button } from './Button';
import { Modal } from './Modal';

type ConfirmOptions = {
  title: string;
  content: string;
  okText: string;
  cancelText: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
};

export type DialogUIHostProps = {
  /** App-provided DialogHandler instance (no IOC inside the kit). */
  dialogHandler: DialogHandler;
  toasterProps?: ComponentProps<typeof Toaster>;
  /** Shown on the OK button while confirm is pending (e.g. spinner icon). */
  pendingIcon?: ReactNode;
  /** Leading icon next to confirm content (e.g. warning icon). */
  warningIcon?: ReactNode;
  /** Forwarded to Modal for the close control. */
  closeIcon?: ReactNode;
};

/**
 * Bridges imperative DialogHandler confirm/toast to React UI.
 * Icons are injected by the app so the kit stays free of icon libraries.
 */
export function DialogUIHost({
  dialogHandler,
  toasterProps,
  pendingIcon,
  warningIcon,
  closeIcon
}: DialogUIHostProps) {
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
        {...toasterProps}
      />
      <Modal
        open={confirmOptions != null}
        title={confirmOptions?.title}
        onClose={closeConfirm}
        closeOnBackdrop={!pending}
        showFullscreenToggle={false}
        closeIcon={closeIcon}
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
                {pending ? pendingIcon : null}
                {confirmOptions.okText}
              </Button>
            </div>
          ) : undefined
        }
      >
        {confirmOptions ? (
          <p className="flex gap-2 text-sm leading-relaxed text-secondary-text">
            {warningIcon}
            <span>{confirmOptions.content}</span>
          </p>
        ) : null}
      </Modal>
    </>
  );
}
