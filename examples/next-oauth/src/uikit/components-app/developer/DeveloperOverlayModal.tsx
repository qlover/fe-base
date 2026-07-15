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
  /** Overrides the default content padding. */
  bodyClassName?: string;
  footerClassName?: string;
  headerClassName?: string;
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
  showFullscreenToggle = true,
  bodyClassName = 'px-4 py-3 sm:px-5 sm:py-4',
  footerClassName,
  headerClassName
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
      bodyClassName="!p-0"
      footerClassName={footerClassName}
      headerClassName={headerClassName}
    >
      <div className={bodyClassName}>{children}</div>
    </Modal>
  );
}

export type { ModalProps };
