'use client';

import { Modal, type ModalProps } from '@/uikit/components/Modal';
import type { ReactNode } from 'react';

export type DeveloperOverlayModalProps = {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Desktop max-width utility, e.g. `sm:max-w-md`. */
  maxWidthClass?: string;
  closeOnBackdrop?: boolean;
  showFullscreenToggle?: boolean;
};

/**
 * App modal shell — wraps responsive {@link Modal} (PAM-style).
 */
export function DeveloperOverlayModal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidthClass = 'sm:max-w-xl',
  closeOnBackdrop = true,
  showFullscreenToggle = true
}: DeveloperOverlayModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={footer}
      closeOnBackdrop={closeOnBackdrop}
      showFullscreenToggle={showFullscreenToggle}
      className={maxWidthClass}
      bodyClassName="px-0 py-0 sm:px-0 sm:py-0"
    >
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </Modal>
  );
}

export type { ModalProps };
