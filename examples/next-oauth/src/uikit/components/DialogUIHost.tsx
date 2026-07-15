'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import {
  DeveloperConfirmDialog,
  type DeveloperConfirmOptions
} from '@/uikit/components-app/developer/DeveloperConfirmDialog';
import { I } from '@config/ioc-identifiter';
import type { DialogHandler, DialogHandlerOptions } from '@/impls/DialogHandler';
import { useIOC } from '../hook/useIOC';

/**
 * Bridges imperative {@link DialogHandler} confirm/toast to React UI.
 */
export function DialogUIHost() {
  const dialogHandler = useIOC(I.DialogHandler) as DialogHandler;
  const [confirmOptions, setConfirmOptions] =
    useState<DeveloperConfirmOptions | null>(null);

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
      <DeveloperConfirmDialog
        open={confirmOptions != null}
        options={confirmOptions}
        onClose={() => {
          setConfirmOptions(null);
        }}
      />
    </>
  );
}
