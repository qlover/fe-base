export const NAVIGATION_GUARD_STATE_KEY = '__nextKitUnsavedGuard';

/**
 * 判断点击是否为新标签 / 修饰键打开，这类跳过未保存拦截。
 */
export function isModifiedAnchorClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/**
 * 从点击目标解析需要拦截的站内链接；外链、下载、hash 仅跳转返回 null。
 */
export function resolveGuardedAnchor(
  event: MouseEvent,
  currentHref: string
): HTMLAnchorElement | null {
  if (event.defaultPrevented || isModifiedAnchorClick(event)) {
    return null;
  }
  const raw = event.target;
  if (!(raw instanceof Element)) {
    return null;
  }
  const anchor = raw.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) {
    return null;
  }
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return null;
  }
  const hrefAttr = anchor.getAttribute('href');
  if (
    hrefAttr == null ||
    hrefAttr.length === 0 ||
    hrefAttr.startsWith('mailto:')
  ) {
    return null;
  }
  const next = new URL(anchor.href, currentHref);
  const current = new URL(currentHref);
  if (next.origin !== current.origin) {
    return null;
  }
  if (next.pathname === current.pathname && next.search === current.search) {
    return null;
  }
  return anchor;
}

export function isGuardHistoryState(state: unknown): boolean {
  if (state == null || typeof state !== 'object') {
    return false;
  }
  return (
    (state as Record<string, unknown>)[NAVIGATION_GUARD_STATE_KEY] === true
  );
}

export function withGuardHistoryState(state: unknown): Record<string, unknown> {
  const base =
    state != null && typeof state === 'object'
      ? { ...(state as Record<string, unknown>) }
      : {};
  return { ...base, [NAVIGATION_GUARD_STATE_KEY]: true };
}
