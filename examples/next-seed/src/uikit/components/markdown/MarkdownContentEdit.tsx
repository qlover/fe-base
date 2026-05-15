'use client';

import { clsx } from 'clsx';

export interface MarkdownContentEditPropsType {
  readonly markdown: string;
  readonly onMarkdownChange: (next: string) => void;
  readonly placeholder: string;
  readonly textareaName: string;
  readonly textareaId?: string;
  readonly rows?: number;
  /** 根节点 `data-testid`。 */
  readonly rootTestId?: string;
}

/**
 * 仅 Markdown 源文本编辑（textarea），不含预览与外壳 Tab。
 */
export function MarkdownContentEdit({
  markdown,
  onMarkdownChange,
  placeholder,
  textareaName,
  textareaId,
  rows = 8,
  rootTestId = 'MarkdownContentEdit'
}: MarkdownContentEditPropsType) {
  return (
    <textarea
      data-testid={rootTestId}
      id={textareaId}
      name={textareaName}
      value={markdown}
      onChange={(e) => onMarkdownChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={clsx(
        'text-primary-text placeholder:text-tertiary-text box-border w-full px-4 py-3 text-sm',
        'max-lg:min-h-44 max-lg:resize-none max-lg:pb-4 max-lg:leading-normal',
        'max-lg:field-sizing-content',
        'focus:ring-brand/40 focus:outline-none focus:ring-1',
        'bg-transparent',
        'lg:min-h-44 lg:flex-1 lg:resize-none lg:leading-relaxed'
      )}
    />
  );
}
