import { Button } from 'antd';
import type { PageParamsProps } from '@/base/types/PageProps';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { redirect } from '@/i18n/routing';
import { AppPageRouteParams, type PageParamsType } from '@/server/AppPageRouteParams';
import { ServerAuth } from '@/server/ServerAuth';
import { BaseLayout } from '@/uikit/components/BaseLayout';
import { i18nConfig, homeI18n } from '@config/i18n';
import type { Metadata } from 'next';

// const navigationItems = [
//   {
//     href: '/identifier',
//     titleKey: 'HOME_IDENTIFIER',
//     descriptionKey: 'HOME_IDENTIFIER_DESCRIPTION'
//   }
// ];

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
  const pageParams = new AppPageRouteParams(await params);
  return await pageParams.getI18nInterface(homeI18n);
}

export default async function Home({ params }: PageParamsProps) {
  const server = new BootstrapServer();
  const pageParams = new AppPageRouteParams(await params!);
  const locale = pageParams.getLocale();
  const tt = await pageParams.getI18nInterface(homeI18n);

  if (!(await server.getIOC(ServerAuth).hasAuth())) {
    return redirect({ href: '/login', locale });
  }

  return (
    <BaseLayout data-testid="HomePage" showLogoutButton showAdminButton>
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
            {tt.welcome}
          </h1>
          <p className="text-xl text-text-secondary mb-8">{tt.description}</p>
        </div>
      </section>

      {/* Navigation Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* {navigationItems.map((item) => (
            <LocaleLink
              data-testid={`HomePage-navigation-${item.href}`}
              key={item.href}
              title={item.titleKey}
              className={clsx(
              href={item.href}
                'block rounded-lg p-6',
                'bg-secondary',
                'border border-border',
                'hover:bg-elevated',
                'transition-colors duration-200'
              )}
            >
              <h3 className={`text-xl font-semibold mb-3 text-text`}>
                {t(item.titleKey)}
              </h3>
              <p className="text-text-secondary mb-4">
                {t(item.descriptionKey)}
              </p>
              <Button type="primary" className="w-full">
                {t(i18nKeys.HOME_EXPLORE)}
              </Button>
            </LocaleLink>
          ))} */}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 bg-elevated">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-text">
            {tt.getStartedTitle}
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            {tt.getStartedDescription}
          </p>
          <Button type="primary" size="large" className="px-8">
            {tt.getStartedButton}
          </Button>
        </div>
      </section>
    </BaseLayout>
  );
}
