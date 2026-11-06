'use client';

import { Loading } from '@qlover/next-kit/client';
import { clsx } from 'clsx';

export interface AdminPanelLoadingProps {
  readonly testId?: string;
  readonly className?: string;
}

/**
 * 后台内容区加载占位。
 */
export function AdminPanelLoading({
  testId = 'AdminPanelLoading',
  className
}: AdminPanelLoadingProps) {
  return (
    <div
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={clsx(
        'flex min-h-48 w-full items-center justify-center py-10',
        className
      )}
    >
      <Loading />
    </div>
  );
}
