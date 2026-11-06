import type { ReactNode } from 'react';
import type { PageI18nInterface } from '../../common/interfaces/PageI18nInterface';

type MetaEntry = {
  readonly attr: 'name' | 'property';
  readonly key: string;
  readonly content: string | undefined;
};

/**
 * Client-side SEO meta tags from a resolved {@link PageI18nInterface}.
 *
 * Open Graph tags use `property` (not `name`); canonical uses `<link rel="canonical">`.
 * When used under the Pages Router, prefer wrapping this component with `next/head`
 * so soft navigations update the document head.
 */
export function ClientSeo(props: {
  i18nInterface: PageI18nInterface;
  children?: ReactNode;
}) {
  const { i18nInterface, children } = props;
  const og = i18nInterface.og;
  const twitter = i18nInterface.twitter;
  const shareTitle = og?.title || i18nInterface.title;
  const shareDescription = og?.description || i18nInterface.description;
  const shareImage = og?.image;

  const entries: readonly MetaEntry[] = [
    { attr: 'name', key: 'description', content: i18nInterface.description },
    { attr: 'name', key: 'keywords', content: i18nInterface.keywords },
    { attr: 'name', key: 'author', content: i18nInterface.author },
    {
      attr: 'name',
      key: 'publishedTime',
      content: i18nInterface.publishedTime
    },
    {
      attr: 'name',
      key: 'modifiedTime',
      content: i18nInterface.modifiedTime
    },
    { attr: 'property', key: 'og:type', content: og?.type || 'website' },
    { attr: 'property', key: 'og:site_name', content: og?.siteName },
    { attr: 'property', key: 'og:locale', content: og?.locale },
    { attr: 'property', key: 'og:title', content: shareTitle },
    { attr: 'property', key: 'og:description', content: shareDescription },
    { attr: 'property', key: 'og:url', content: og?.url },
    { attr: 'property', key: 'og:image', content: shareImage },
    {
      attr: 'name',
      key: 'twitter:card',
      content: twitter?.card || (shareImage ? 'summary_large_image' : undefined)
    },
    {
      attr: 'name',
      key: 'twitter:site',
      content: twitter?.site
    },
    {
      attr: 'name',
      key: 'twitter:creator',
      content: twitter?.creator
    },
    {
      attr: 'name',
      key: 'twitter:title',
      content: twitter?.title || shareTitle
    },
    {
      attr: 'name',
      key: 'twitter:description',
      content: twitter?.description || shareDescription
    },
    {
      attr: 'name',
      key: 'twitter:image',
      content: twitter?.image || shareImage
    }
  ];

  return (
    <>
      <title>{i18nInterface.title}</title>
      {entries.map((entry) =>
        entry.content ? (
          <meta
            key={entry.key}
            {...{ [entry.attr]: entry.key }}
            content={entry.content}
          />
        ) : null
      )}
      {i18nInterface.canonical ? (
        <link rel="canonical" href={i18nInterface.canonical} />
      ) : null}
      {children}
    </>
  );
}
