import type { PageI18nInterface } from '@config/i18n/PageI18nInterface';
import { useEffect } from 'react';

export function ClientSeo(props: {
  i18nInterface: PageI18nInterface;
  children?: React.ReactNode;
}) {
  const { i18nInterface, children } = props;

  useEffect(() => {
    // Set title
    document.title = i18nInterface.title;

    // Helper function to create or update meta tag
    const setMetaTag = (name: string, content: string | undefined) => {
      if (!content) return;
      
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Set basic meta tags
    setMetaTag('description', i18nInterface.description);
    setMetaTag('keywords', i18nInterface.keywords);
    setMetaTag('author', i18nInterface.author);
    setMetaTag('publishedTime', i18nInterface.publishedTime);
    setMetaTag('modifiedTime', i18nInterface.modifiedTime);

    // Set canonical
    if (i18nInterface.canonical) {
      setMetaTag('canonical', i18nInterface.canonical);
    }

    // Set Open Graph tags
    if (i18nInterface.og) {
      setMetaTag('og:title', i18nInterface.og.title);
      setMetaTag('og:description', i18nInterface.og.description);
      setMetaTag('og:image', i18nInterface.og.image);
    }

    // Cleanup function (optional, removes meta tags when component unmounts)
    return () => {
      // You can optionally remove these tags on unmount
      // const metaNames = [
      //   'description', 'keywords', 'author', 'publishedTime', 
      //   'modifiedTime', 'canonical', 'og:title', 'og:description', 'og:image'
      // ];
      // metaNames.forEach(name => {
      //   const meta = document.querySelector(`meta[name="${name}"]`);
      //   if (meta) meta.remove();
      // });
    };
  }, [i18nInterface]);

  return <>{children}</>;
}
