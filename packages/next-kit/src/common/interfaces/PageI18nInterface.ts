/**
 * Resolved page SEO / copy bag. Values are already translated strings
 * (or optional nested meta). Apps extend this for page-specific keys.
 */
export interface PageI18nInterface {
  title: string;
  description: string;
  content: string;
  keywords: string;

  canonical?: string;

  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
  };

  og?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
    siteName?: string;
    locale?: string;
  };

  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}
