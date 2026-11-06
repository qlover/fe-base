'use client';

import { useEffect, useState } from 'react';
import { readAdminAnchor } from './AdminAnchorUtil';

const HIGHLIGHT_MS = 2200;
const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]), textarea, select, button[role="switch"]';

/**
 * 按地址栏 hash 定位后台元素（id 即锚点）。
 *
 * @param ready - 目标已渲染
 * @returns 当前高亮锚点；无则为 null
 */
export function useAdminAnchorFocus(ready: boolean): string | null {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      return;
    }
    let clearTimer: ReturnType<typeof setTimeout> | undefined;

    const focusAnchor = (): void => {
      const anchor = readAdminAnchor(window.location.hash);
      if (!anchor) {
        return;
      }
      const element = document.getElementById(anchor);
      if (!element) {
        return;
      }
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const control = element.matches(FOCUSABLE_SELECTOR)
        ? element
        : element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      control?.focus({ preventScroll: true });
      setHighlighted(anchor);
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
    };

    const frame = requestAnimationFrame(focusAnchor);
    window.addEventListener('hashchange', focusAnchor);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(clearTimer);
      window.removeEventListener('hashchange', focusAnchor);
    };
  }, [ready]);

  return highlighted;
}
