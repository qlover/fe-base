'use client';

import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  /** Extra header actions (left of fullscreen/close). */
  actions?: ReactNode;
  /** Fully custom header; ignores title/actions when set. */
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  defaultFullscreen?: boolean;
  fullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  showFullscreenToggle?: boolean;
  closeOnBackdrop?: boolean;
  closeLabel?: string;
  expandLabel?: string;
  collapseLabel?: string;
  /** Applied to the panel (e.g. `sm:max-w-xl`). */
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  headerClassName?: string;
}

/**
 * Responsive modal inspired by PAM `ResponsiveModal`:
 * - Mobile: bottom sheet
 * - Desktop: centered card
 * - Optional fullscreen toggle
 */
export function Modal({
  open,
  onClose,
  title,
  actions,
  header,
  footer,
  children,
  defaultFullscreen = false,
  fullscreen: fullscreenProp,
  onFullscreenChange,
  showFullscreenToggle = true,
  closeOnBackdrop = true,
  closeLabel = 'Close',
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
  className,
  bodyClassName,
  footerClassName,
  headerClassName
}: ModalProps) {
  const [internalFullscreen, setInternalFullscreen] =
    useState(defaultFullscreen);
  const isFullscreen =
    fullscreenProp !== undefined ? fullscreenProp : internalFullscreen;

  const toggleFullscreen = useCallback(() => {
    const next = !isFullscreen;
    if (fullscreenProp === undefined) {
      setInternalFullscreen(next);
    }
    onFullscreenChange?.(next);
  }, [isFullscreen, fullscreenProp, onFullscreenChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setInternalFullscreen(defaultFullscreen);
    }
  }, [open, defaultFullscreen]);

  if (!open || typeof document === 'undefined') return null;

  const renderHeader = () => {
    if (header) return header;

    return (
      <div
        data-testid="ModalHeader"
        className={clsx(
          'border-primary-border bg-elevated flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 sm:py-4',
          headerClassName
        )}
      >
        <div className="min-w-0 text-base font-semibold text-primary-text sm:text-lg">
          {title ?? (
            <span className="bg-brand inline-block h-2 w-2 animate-pulse rounded-full" />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          {showFullscreenToggle && (
            <button
              type="button"
              aria-label={isFullscreen ? collapseLabel : expandLabel}
              onClick={toggleFullscreen}
              className="text-tertiary-text hover:bg-secondary hover:text-secondary-text rounded-lg p-1.5 transition-colors"
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="text-tertiary-text hover:bg-secondary hover:text-secondary-text rounded-lg p-1.5 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    <div
      data-testid="Modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex flex-col justify-end pt-10 sm:items-center sm:justify-center sm:p-4 sm:pt-4"
    >
      <button
        type="button"
        aria-label={closeLabel}
        tabIndex={-1}
        className="absolute inset-0 z-0 border-0 bg-black/45 backdrop-blur-[2px] dark:bg-black/70"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        className={clsx(
          'border-primary-border bg-primary overflow-hidden shadow-2xl ring-1 ring-primary-border/40',
          isFullscreen
            ? 'fixed inset-x-0 bottom-0 top-14 z-1 flex flex-col rounded-t-3xl sm:inset-4 sm:rounded-2xl'
            : 'relative z-1 flex w-full max-h-[92vh] flex-col rounded-t-3xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl',
          className
        )}
      >
        {renderHeader()}

        <div
          className={clsx(
            'overflow-y-auto px-4 py-4 text-primary-text sm:px-6 sm:py-5',
            isFullscreen ? 'min-h-0 flex-1' : 'shrink-0',
            bodyClassName
          )}
        >
          {children}
        </div>

        {footer != null && (
          <div
            className={clsx(
              'border-primary-border bg-elevated/40 shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
