export interface I18nMappingInterface {
  // Basic meta properties
  title: string;
  description: string;
  content: string;
  keywords: string;

  // Canonical URL
  canonical?: string;

  // Robots meta
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
  };

  // Open Graph meta properties
  og?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
    siteName?: string;
    locale?: string;
  };

  // Twitter Card meta properties
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  // Additional meta properties
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}
