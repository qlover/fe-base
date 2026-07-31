import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { ReactNode, HTMLAttributes, FC } from 'react';

export type LocaleLinkHref =
  | string
  | {
      pathname: string;
      query?: Record<string, string>;
      hash?: string;
    };

export type LocaleLinkProps = Omit<LinkProps, 'href'> &
  Omit<HTMLAttributes<HTMLAnchorElement>, 'children'> & {
    href: LocaleLinkHref;
    locale?: string;
    title: string;
    children: ReactNode;
    /** When equal to `locale`, path prefix is omitted if `useLocaleRoutes` is true. */
    defaultLocale?: string;
    className?: string;
    /**
     * Fallback when `locale` prop is omitted.
     * Replaces app `i18nConfig.fallbackLng`.
     */
    fallbackLocale: string;
    /**
     * Whether locale segments are prefixed on paths.
     * Replaces app `useLocaleRoutes` config flag.
     */
    useLocaleRoutes?: boolean;
  };

/**
 * `next/link` wrapper that optionally prefixes `/{locale}` on the href.
 */
export const LocaleLink: FC<LocaleLinkProps> = ({
  href,
  locale,
  children,
  defaultLocale,
  fallbackLocale,
  useLocaleRoutes = false,
  ...props
}) => {
  const resolvedLocale = locale || fallbackLocale;
  const isDefaultLocale = resolvedLocale === defaultLocale;
  const shouldAddLocale = useLocaleRoutes && !isDefaultLocale;

  let localizedHref: LocaleLinkHref;
  if (typeof href === 'string') {
    localizedHref = shouldAddLocale ? `/${resolvedLocale}${href}` : href;
  } else {
    localizedHref = {
      ...href,
      pathname: shouldAddLocale
        ? `/${resolvedLocale}${href.pathname}`
        : href.pathname
    };
  }

  return (
    <Link data-testid="locale-link" {...props} href={localizedHref}>
      {children}
    </Link>
  );
};
