import Link from 'next/link';
import { useLocaleRoutes } from '@config/common';
import type { LinkProps } from 'next/link';
import type { ReactNode } from 'react';

interface LocaleLinkProps
  extends Omit<LinkProps, 'href'>,
    React.HTMLAttributes<HTMLAnchorElement> {
  href:
    | string
    | {
        pathname: string;
        query?: Record<string, string>;
        hash?: string;
      };
  locale?: string;
  title: string;
  children: ReactNode;
  defaultLocale?: string;
  className?: string;
}

export const LocaleLink: React.FC<LocaleLinkProps> = ({
  href,
  locale,
  children,
  defaultLocale,
  ...props
}) => {
  locale = locale || 'en';

  const isDefaultLocale = locale === defaultLocale;
  const shouldAddLocale = useLocaleRoutes && !isDefaultLocale;

  let localizedHref: typeof href;
  if (typeof href === 'string') {
    localizedHref = shouldAddLocale ? `/${locale}${href}` : href;
  } else {
    localizedHref = {
      ...href,
      pathname: shouldAddLocale ? `/${locale}${href.pathname}` : href.pathname
    };
  }

  return (
    <Link data-testid='locale-link' {...props} href={localizedHref}>
      {children}
    </Link>
  );
};
