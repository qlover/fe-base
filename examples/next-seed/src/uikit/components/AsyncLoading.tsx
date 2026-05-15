import {
  AsyncStoreStatus,
  type AsyncStoreStateInterface
} from '@qlover/corekit-bridge';
import { Spin } from 'antd';
import { clsx } from 'clsx';
import { type ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';
import type { SpinProps } from 'antd';

export type AsyncLoadingProps = {
  state: AsyncStoreStateInterface<unknown>;
  message: ReactNode;
  errorMessage?: unknown;
  onRetry?: () => void;
  retryLabel?: ReactNode;
  className?: string;
  spin?: SpinProps;
};
export function AsyncLoading(props: AsyncLoadingProps) {
  const {
    state,
    message,
    errorMessage,
    retryLabel,
    spin: spinProps,
    onRetry,
    className
  } = props;

  const status = state.status;
  const loading = !!state.loading || status === AsyncStoreStatus.PENDING;
  const failed = status === AsyncStoreStatus.FAILED;
  const error = errorMessage ?? state.error;

  return (
    <div
      data-testid="AsyncLoading"
      className={clsx(
        'flex min-h-[min(200px,40dvh)] flex-col items-center justify-center gap-4 px-2 py-6 md:min-h-80 md:gap-5 md:px-4 md:py-8',
        className
      )}
    >
      {loading ? <Spin {...spinProps} /> : null}

      <p className="text-secondary-text text-center text-sm leading-relaxed">
        {message}
      </p>
      {failed ? (
        <div className="flex flex-col items-center gap-3">
          {error !== null ? <ErrorMessage error={error} /> : null}
          <button
            type="button"
            onClick={onRetry}
            className="border-primary-border bg-secondary/40 hover:border-brand/50 text-primary-text rounded-lg border px-3 py-2 text-sm transition-colors active:bg-secondary/60"
          >
            {retryLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
