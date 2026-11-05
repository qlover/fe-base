import { ClientSeo } from '@qlover/next-kit/client';
import { clsx } from 'clsx';
import type { PageI18nInterface } from '@qlover/next-kit/common';
import type { ReactNode } from 'react';

export interface AdminPageShellProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
  /** 设置后更新本页 document title */
  readonly seoMetadata?: PageI18nInterface;
}

/**
 * 后台页标题 + 内容区。外层宽度由 {@link AdminLayout} 控制。
 */
export function AdminPageShell({
  title,
  description,
  children,
  className,
  contentClassName,
  seoMetadata
}: AdminPageShellProps) {
  return (
    <div data-testid="AdminPageShell" className={clsx('w-full', className)}>
      {seoMetadata ? <ClientSeo i18nInterface={seoMetadata} /> : null}
      <header className="mb-5 border-b border-primary-border/70 pb-4 sm:mb-8 sm:pb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary-text sm:text-2xl lg:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-secondary-text sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </header>
      <div className={clsx('w-full', contentClassName)}>{children}</div>
    </div>
  );
}
