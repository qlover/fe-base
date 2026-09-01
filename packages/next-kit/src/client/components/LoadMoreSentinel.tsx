'use client';

import { useEffect, useRef, type ReactElement } from 'react';

/**
 * List bottom sentinel: loads more when scrolled into view.
 * Skips the first intersection when the page has not been scrolled yet.
 */
export function LoadMoreSentinel(props: {
  readonly hasMore: boolean;
  readonly loading: boolean;
  readonly loadMoreLabel: string;
  readonly endLabel: string;
  readonly onLoadMore: () => void;
  readonly 'data-testid'?: string;
}): ReactElement {
  const {
    hasMore,
    loading,
    loadMoreLabel,
    endLabel,
    onLoadMore,
    'data-testid': dataTestId = 'LoadMoreSentinel'
  } = props;
  const ref = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!hasMore || loading) {
      return;
    }
    const node = ref.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        if (typeof window !== 'undefined' && window.scrollY <= 1) {
          return;
        }
        onLoadMoreRef.current();
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div
      ref={ref}
      data-testid={dataTestId}
      className="text-secondary-text min-h-10 py-3 text-center text-sm"
      aria-busy={loading}
    >
      {loading ? loadMoreLabel : hasMore ? null : endLabel}
    </div>
  );
}
