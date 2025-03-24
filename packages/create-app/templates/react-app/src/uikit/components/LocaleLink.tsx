import { LinkProps, Link as RouterLink, To, useParams } from 'react-router-dom';
import { ReactNode } from 'react';

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

  let localizedHref: string | To;
  if (typeof href === 'string') {
    localizedHref = isDefaultLocale ? href : `/${locale}${href}`;
  } else {
    localizedHref = {
      ...href,
      pathname: isDefaultLocale ? href.pathname : `/${locale}${href.pathname}`
    };
  }

  return (
    <RouterLink {...props} to={localizedHref}>
      {children}
    </RouterLink>
  );
};

export default LocaleLink;
