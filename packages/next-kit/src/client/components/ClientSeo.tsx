import type { ReactNode } from 'react';
import type { PageI18nInterface } from '../../common/interfaces/PageI18nInterface';
import { With } from './With';

/**
 * Client-side SEO meta tags from a resolved {@link PageI18nInterface}.
 */
export function ClientSeo(props: {
  i18nInterface: PageI18nInterface;
  children?: ReactNode;
}) {
  const { i18nInterface, children } = props;

  return (
    <>
      <title>{i18nInterface.title}</title>
      <meta name="description" content={i18nInterface.description} />
      <meta name="keywords" content={i18nInterface.keywords} />
      <meta name="author" content={i18nInterface.author} />
      <meta name="publishedTime" content={i18nInterface.publishedTime} />
      <meta name="modifiedTime" content={i18nInterface.modifiedTime} />

      <With it={i18nInterface.canonical}>
        <meta name="canonical" content={i18nInterface.canonical} />
      </With>

      <With it={i18nInterface.og}>
        {({ title, description, image }) => (
          <>
            <meta name="og:title" content={title} />
            <meta name="og:description" content={description} />
            <meta name="og:image" content={image} />
          </>
        )}
      </With>

      {children}
    </>
  );
}
