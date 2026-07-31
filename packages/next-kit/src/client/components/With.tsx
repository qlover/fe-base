import type { ReactNode } from 'react';

/**
 * Renders `children` when `it` is non-nullish and not `false`; otherwise `fallback`.
 */
export function With<T>(props: {
  fallback?: ReactNode;
  it: T;
  children: ReactNode | ((it: NonNullable<T>) => ReactNode);
}) {
  const { fallback, it, children } = props;

  if (it != null && it !== false) {
    if (typeof children === 'function') {
      return children(it as NonNullable<T>);
    }

    return children;
  }

  return fallback ?? null;
}
