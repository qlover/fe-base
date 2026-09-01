'use client';

import { clsx } from 'clsx';
import type { ReactElement } from 'react';

const DEFAULT_ROW_COUNT = 4;

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

function SkeletonRows(props: {
  readonly count: number;
  readonly rowTestId?: string;
}): ReactElement {
  return (
    <div data-testid="SkeletonRows" className="flex flex-col gap-2">
      {Array.from({ length: props.count }, (_, index) => (
        <div
          data-testid={props.rowTestId}
          key={index}
          className={clsx(
            'border-primary-border/60 bg-elevated',
            'h-12 animate-pulse rounded-lg border'
          )}
        />
      ))}
    </div>
  );
}

export function LoadingSkeleton(props: {
  readonly label: string;
  readonly variant?: 'page' | 'section';
  readonly testId?: string;
  readonly rows?: number;
}): ReactElement {
  const { label, variant = 'page', testId, rows = DEFAULT_ROW_COUNT } = props;

  return (
    <div
      data-testid={testId}
      className="flex min-w-0 flex-col gap-4"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      {variant === 'page' ? (
        <div
          className={clsx(
            'border-primary-border bg-bg-container',
            'flex flex-col items-center justify-center gap-3 rounded-lg border py-8'
          )}
        >
          <SpinnerIcon className="text-brand h-8 w-8 animate-spin" />
          <span className="text-secondary-text text-sm">{label}</span>
        </div>
      ) : null}
      <SkeletonRows count={rows} />
    </div>
  );
}
