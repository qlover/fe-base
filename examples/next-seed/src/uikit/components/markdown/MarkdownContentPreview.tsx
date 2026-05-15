'use client';

import { clsx } from 'clsx';
import { Streamdown } from 'streamdown';

const MARKDOWN_CLASS =
  'text-primary-text text-base leading-relaxed [&_h1]:text-primary-text [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-primary-text [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-primary-text [&_h3]:font-semibold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-0.5 [&_a]:text-brand [&_a]:underline [&_strong]:text-primary-text [&_strong]:font-semibold [&_blockquote]:border-l-4 [&_blockquote]:border-brand/40 [&_blockquote]:bg-brand/5 [&_blockquote]:pl-4 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:rounded-r [&_code]:font-mono [&_code]:text-sm [&_code]:bg-secondary/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-secondary/60 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:overflow-x-auto [&_hr]:border-primary-border [&_hr]:my-4 [&_p]:mb-3 [&_p:last-child]:mb-0';

export interface MarkdownContentPreviewPropsType {
  readonly markdown: string;
  readonly previewEmptyText: string;
  readonly rootTestId?: string;
}

/**
 * 仅 Markdown 静态预览（Streamdown），不含编辑与外壳 Tab。
 */
export function MarkdownContentPreview({
  markdown,
  previewEmptyText,
  rootTestId = 'MarkdownContentPreview'
}: MarkdownContentPreviewPropsType) {
  return (
    <div data-testid={rootTestId} className={clsx('p-4 sm:p-8')}>
      {markdown.trim() ? (
        <Streamdown mode="static" className={MARKDOWN_CLASS}>
          {markdown}
        </Streamdown>
      ) : (
        <div className="text-tertiary-text flex h-full min-h-28 items-center justify-center text-sm">
          {previewEmptyText}
        </div>
      )}
    </div>
  );
}
