import { LinkProps, Link as RouterLink, To, useParams } from 'react-router-dom';
import { ReactNode } from 'react';
import { useLocaleRoutes } from '@config/common';

interface LocaleLinkProps extends Omit<LinkProps, 'href' | 'to'> {
  href: string | To;
  locale?: string;
  children: ReactNode;
  defaultLocale?: string;
  className?: string;
}

const LocaleLink: React.FC<LocaleLinkProps> = ({
  href,
  locale,
  children,
  defaultLocale,
  ...props
}) => {
  const { lng } = useParams<{ lng: string }>();

  locale = locale || lng;

  const isDefaultLocale = locale === defaultLocale;
  const shouldAddLocale = useLocaleRoutes && !isDefaultLocale;

  let localizedHref: string | To;
  if (typeof href === 'string') {
    localizedHref = shouldAddLocale ? `/${locale}${href}` : href;
  } else {
    localizedHref = {
      ...href,
      pathname: shouldAddLocale ? `/${locale}${href.pathname}` : href.pathname
    };
  }

  return (
    <RouterLink data-testid="locale-link" {...props} to={localizedHref}>
      {children}
    </RouterLink>
  );
};

export default LocaleLink;
