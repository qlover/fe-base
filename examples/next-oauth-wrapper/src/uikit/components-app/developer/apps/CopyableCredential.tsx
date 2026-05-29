'use client';

import { CopyOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';
import { oauthGhostActionClass } from '@/uikit/styles/oauthUiStyles';

export function CopyableCredential(props: {
  value: string;
  onCopy: () => void;
  className?: string;
}) {
  const { value, onCopy, className } = props;

  return (
    <div
      data-testid="CopyableCredential"
      className={clsx('flex items-center gap-2 min-w-0', className)}
    >
      <code className="flex-1 min-w-0 bg-secondary text-primary-text px-2 py-2 rounded-lg text-sm break-all font-mono border border-primary-border/40">
        {value}
      </code>
      <button
        type="button"
        onClick={onCopy}
        className={clsx(oauthGhostActionClass, 'shrink-0 px-2')}
        aria-label="Copy"
      >
        <CopyOutlined />
      </button>
    </div>
  );
}
