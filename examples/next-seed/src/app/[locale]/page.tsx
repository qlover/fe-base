import { Button } from 'antd';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { HomeAuthUserEmail } from '@/uikit/components-app/HomeAuthUserEmail';
import { i18nConfig } from '@config/i18n';
import { homeI18n, homeI18nNamespace } from '@config/i18n-mapping/HomeI18n';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import {
  getI18nInterface,
  getLocale,
  type PageParamsType
} from '@server/render/pageRouteParams';
import type { Metadata } from 'next';

// Generate static params for all supported locales (used for SSG)
export async function generateStaticParams() {
  // Return one entry for each supported locale
  return i18nConfig.supportedLngs.map((locale) => ({ locale }));
}

// Allow Next.js to statically generate this page if possible (default behavior)
// Note: 'auto' is not a valid value in Next.js 15, removed to use default behavior

// Optional: Use revalidate if you want ISR (Incremental Static Regeneration)
// export const revalidate = 3600; // Rebuild every hour (optional)

// Generate localized SEO metadata per locale (Next.js 15+ best practice)
export async function generateMetadata({
  params
}: {
  params: Promise<PageParamsType>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = getLocale(resolvedParams);
  return await getI18nInterface(locale, homeI18n);
}

export default async function Home({ params }: PageParamsProps) {
  const resolvedParams = await params!;
  const locale = getLocale(resolvedParams);
  const tt = await getI18nInterface(locale, homeI18n, homeI18nNamespace);

  return (
    <AppRoutePage tt={tt} showAdminButton showAuthButton>
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary-text">
            {tt.welcome}
          </h1>
          <HomeAuthUserEmail />
          <p className="text-xl text-secondary-text mb-8">{tt.description}</p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-elevated">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-text">
            {tt.getStartedTitle}
          </h2>
          <p className="text-lg text-secondary-text mb-8">
            {tt.getStartedDescription}
          </p>
          <Button type="primary" size="large" className="px-8">
            {tt.getStartedButton}
          </Button>
        </div>
      </section>
    </AppRoutePage>
  );
}
