'use client';

import { clsx } from 'clsx';
import { AdminAnchorButton } from './AdminAnchorButton';
import { readAdminAnchor } from './AdminAnchorUtil';
import type { MouseEvent, ReactNode } from 'react';

/**
 * 可直达标题：悬停显示 `#` 复制链接；点击标题更新 hash。
 */
export function AdminAnchorTitle({
  anchor,
  linkable = true,
  className,
  children
}: {
  readonly anchor: string;
  readonly linkable?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
}): ReactNode {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (readAdminAnchor(window.location.hash) === anchor) {
      event.preventDefault();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  };

  return (
    <span
      data-testid="AdminAnchorTitle"
      className="relative inline-flex items-center"
    >
      <span className="absolute right-full pr-0.5">
        <AdminAnchorButton anchor={anchor} />
      </span>
      {linkable ? (
        <a
          href={`#${encodeURIComponent(anchor)}`}
          onClick={handleClick}
          className={clsx('hover:text-brand transition-colors', className)}
        >
          {children}
        </a>
      ) : (
        <span className={className}>{children}</span>
      )}
    </span>
  );
}
