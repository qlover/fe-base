'use client';

import { clsx } from 'clsx';
import { useEffect, useState, type ReactNode } from 'react';
import { useI18nMapping } from '@/uikit/hook/useI18nMapping';
import { adminAnchorI18n } from '@config/i18n-mapping/admin18n';

const COPIED_MS = 1500;

/**
 * 标题前的 `#`：点击复制当前页 + 锚点直达链接。
 */
export function AdminAnchorButton({
  anchor
}: {
  readonly anchor: string;
}): ReactNode {
  const tt = useI18nMapping(adminAnchorI18n);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleClick = (): void => {
    const url = new URL(window.location.href);
    url.hash = encodeURIComponent(anchor);
    window.history.replaceState(window.history.state, '', url.toString());
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    void navigator.clipboard
      ?.writeText(url.toString())
      .then(() => setCopied(true))
      .catch(() => undefined);
  };

  const text = copied ? tt.linkCopied : tt.copyLink;
  return (
    <button
      type="button"
      data-testid="AdminAnchorButton"
      title={text}
      aria-label={text}
      onClick={handleClick}
      className={clsx(
        'rounded px-1 text-xs font-semibold transition',
        copied
          ? 'text-emerald-600 opacity-100'
          : 'text-tertiary-text hover:text-brand opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
      )}
    >
      {copied ? '✓' : '#'}
    </button>
  );
}
