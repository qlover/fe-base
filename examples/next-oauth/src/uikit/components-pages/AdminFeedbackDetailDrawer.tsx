'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { AdminFeedbackDetailPanel } from '@/uikit/components-pages/AdminFeedbackDetailPanel';
import type { AdminFeedbackI18nInterface } from '@config/i18n-mapping/admin18n';
import type {
  UserFeedbackAdminItemType,
  UserFeedbackCategoryType,
  UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';

const DRAWER_MS = 200;

export type AdminFeedbackDetailDrawerPropsType = {
  readonly item: UserFeedbackAdminItemType;
  readonly tt: AdminFeedbackI18nInterface;
  readonly canUpdate: boolean;
  readonly pending: boolean;
  readonly categoryLabel: (category: UserFeedbackCategoryType) => string;
  readonly statusLabel: (status: UserFeedbackStatusType) => string;
  readonly onStatusChange: (status: UserFeedbackStatusType) => void;
  readonly onCreateIssue: () => void;
  readonly onSyncScreenshots: () => void;
  readonly onClose: () => void;
};

/**
 * 反馈详情右侧抽屉：遮罩 / Esc 关闭，滑入动画。
 */
export function AdminFeedbackDetailDrawer(
  props: AdminFeedbackDetailDrawerPropsType
): ReactNode {
  const {
    item,
    tt,
    canUpdate,
    pending,
    categoryLabel,
    statusLabel,
    onStatusChange,
    onCreateIssue,
    onSyncScreenshots,
    onClose
  } = props;
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  const requestClose = useCallback(() => {
    setShown(false);
    window.setTimeout(onClose, DRAWER_MS);
  }, [onClose]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [requestClose]);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [item.id]);

  return createPortal(
    <div data-testid="AdminFeedbackDetailDrawer" className="fixed inset-0 z-60">
      <div
        className={clsx(
          'absolute inset-0 bg-black/25 transition-opacity duration-200',
          shown ? 'opacity-100' : 'opacity-0'
        )}
        onClick={requestClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-label={tt.detailTitle}
        className={clsx(
          'absolute inset-y-0 right-0 w-full max-w-120 overflow-y-auto overscroll-contain border-l border-primary-border bg-secondary p-5 shadow-2xl transition-transform duration-200 ease-out lg:max-w-160 lg:p-6',
          shown ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-primary-text">
            {tt.detailTitle}
          </h2>
          <button
            type="button"
            onClick={requestClose}
            aria-label={tt.detailClose}
            title={tt.detailClose}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-primary-border bg-surface text-secondary-text hover:bg-elevated"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <AdminFeedbackDetailPanel
          item={item}
          tt={tt}
          canUpdate={canUpdate}
          pending={pending}
          categoryLabel={categoryLabel}
          statusLabel={statusLabel}
          onStatusChange={onStatusChange}
          onCreateIssue={onCreateIssue}
          onSyncScreenshots={onSyncScreenshots}
        />
      </aside>
    </div>,
    document.body
  );
}
