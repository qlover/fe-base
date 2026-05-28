'use client';

import { clsx } from 'clsx';
import { useEffect, type ReactNode } from 'react';

export function DeveloperOverlayModal(props: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
  closeOnBackdrop?: boolean;
}) {
  const {
    open,
    title,
    onClose,
    children,
    footer,
    maxWidthClass = 'max-w-xl',
    closeOnBackdrop = true
  } = props;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="DeveloperOverlayModal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 dark:bg-black/70 backdrop-blur-[2px]"
        aria-label="Close"
        tabIndex={-1}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        className={clsx(
          'relative w-full bg-primary rounded-2xl shadow-xl border border-primary-border overflow-hidden',
          maxWidthClass
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-primary-border bg-elevated/50">
          <h2 className="text-lg font-semibold text-primary-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary-text hover:text-primary-text text-2xl leading-none px-2 py-1 rounded-lg hover:bg-elevated transition"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5 text-primary-text">{children}</div>
        {footer != null && (
          <div className="px-5 sm:px-6 py-4 border-t border-primary-border bg-elevated/30">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
