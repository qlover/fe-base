'use client';

import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { Button } from '@/uikit/components/Button';

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
      <Button
        variant="ghost"
        className="shrink-0 px-2"
        onClick={onCopy}
        aria-label="Copy"
      >
        <ClipboardDocumentIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
