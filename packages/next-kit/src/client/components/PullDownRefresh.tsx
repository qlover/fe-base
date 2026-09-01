'use client';

import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type TouchEvent
} from 'react';

const PULL_THRESHOLD_PX = 56;
const MAX_PULL_PX = 88;

function SpinnerIcon(props: { className?: string }): ReactElement {
  return (
    <svg
      data-testid="SpinnerIcon" viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={props.className}
    >
      <path
        d="M4 12a8 8 0 0 1 14.9-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PullDownRefresh(props: {
  readonly enabled: boolean;
  readonly refreshing: boolean;
  readonly onRefresh: () => void;
  readonly pullHint: string;
  readonly releaseHint: string;
  readonly refreshingLabel: string;
  readonly children: ReactNode;
  readonly 'data-testid'?: string;
}): ReactElement {
  const {
    enabled,
    refreshing,
    onRefresh,
    pullHint,
    releaseHint,
    refreshingLabel,
    children,
    'data-testid': dataTestId = 'PullDownRefresh'
  } = props;

  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);

  const atScrollTop = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.scrollY <= 1;
  }, []);

  const resetPull = useCallback(() => {
    pullingRef.current = false;
    startYRef.current = null;
    if (!refreshing) {
      setPullDistance(0);
    }
  }, [refreshing]);

  useEffect(() => {
    if (!refreshing) {
      setPullDistance(0);
    }
  }, [refreshing]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!enabled || refreshing || !atScrollTop()) {
      return;
    }
    startYRef.current = event.touches[0]?.clientY ?? null;
    pullingRef.current = startYRef.current != null;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!enabled || refreshing || !pullingRef.current) {
      return;
    }
    const startY = startYRef.current;
    if (startY == null || !atScrollTop()) {
      resetPull();
      return;
    }
    const currentY = event.touches[0]?.clientY ?? startY;
    const delta = Math.max(0, currentY - startY);
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    setPullDistance(Math.min(delta * 0.5, MAX_PULL_PX));
  };

  const handleTouchEnd = () => {
    if (!pullingRef.current) {
      return;
    }
    const shouldRefresh =
      enabled && !refreshing && pullDistance >= PULL_THRESHOLD_PX;
    pullingRef.current = false;
    startYRef.current = null;
    if (shouldRefresh) {
      setPullDistance(PULL_THRESHOLD_PX);
      onRefresh();
      return;
    }
    resetPull();
  };

  const indicatorHeight = refreshing
    ? PULL_THRESHOLD_PX
    : Math.max(0, pullDistance);
  const ready = pullDistance >= PULL_THRESHOLD_PX;
  const hint = refreshing ? refreshingLabel : ready ? releaseHint : pullHint;

  return (
    <div
      data-testid={dataTestId}
      className="relative min-w-0"
      aria-busy={refreshing}
    >
      <div
        data-testid={`${dataTestId}Indicator`}
        className={clsx(
          'pointer-events-none absolute inset-x-0 top-0 z-10',
          'flex items-end justify-center overflow-hidden',
          'transition-[height] duration-200 ease-out'
        )}
        style={{ height: indicatorHeight }}
        aria-hidden={indicatorHeight <= 0}
      >
        <div className="text-secondary-text flex items-center gap-2 pb-2 text-sm">
          <SpinnerIcon
            className={clsx(
              'h-4 w-4 shrink-0 transition-transform',
              refreshing
                ? 'text-brand animate-spin'
                : ready
                  ? 'text-brand rotate-180'
                  : 'opacity-70'
            )}
          />
          <span>{hint}</span>
        </div>
      </div>
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform:
            indicatorHeight > 0 ? `translateY(${indicatorHeight}px)` : undefined
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}
