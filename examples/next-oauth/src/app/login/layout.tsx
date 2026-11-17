import { i18nConfig } from '@config/i18n';
import type { ReactNode } from 'react';

type LoginAliasLayoutProps = {
  readonly children: ReactNode;
};

/**
 * `/login` 不在 `[locale]` 下，Next 要求该分支自带根 layout。
 * 页面只做跳转，这里只提供 html/body。
 */
export default function LoginAliasLayout({ children }: LoginAliasLayoutProps) {
  return (
    <html data-testid="LoginAliasLayout" lang={i18nConfig.fallbackLng}>
      <body>{children}</body>
    </html>
  );
}
