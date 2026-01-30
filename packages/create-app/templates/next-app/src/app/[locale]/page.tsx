import { Button } from 'antd';
import type { PageParamsProps } from '@/base/types/AppPageRouter';
import { bootstrapServer } from '@/core/bootstraps/BootstrapServer';
import {
  AppPageRouteParams,
  type PageParamsType
} from '@/server/AppPageRouteParams';
import { ServerAuth } from '@/server/ServerAuth';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { i18nConfig, homeI18n, homeI18nNamespace } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/Identifier';
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
  const pageParams = new AppPageRouteParams(await params!);
  const user = await bootstrapServer.getIOC(ServerAuth).getUser();

  // const locale = pageParams.getLocale();
  const tt = await pageParams.getI18nInterface(
    {
      ...homeI18n,
      adminTitle: COMMON_ADMIN_TITLE
    },
    homeI18nNamespace
  );

  return (
    <AppRoutePage
      data-testid="AppRoute-HomePage"
      tt={{
        title: tt.title,
        adminTitle: tt.adminTitle
      }}
      showAdminButton
      showAuthButton
    >
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
            {tt.welcome}
          </h1>
          {!!user ? (
            <p data-testid="AuthUserEmail" className="text-lg text-text">
              {user.email}
            </p>
          ) : null}
          <p className="text-xl text-text-secondary mb-8">{tt.description}</p>
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
    </AppRoutePage>
  );
}
