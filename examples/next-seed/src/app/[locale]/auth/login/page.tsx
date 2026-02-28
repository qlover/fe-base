import { notFound } from 'next/navigation';
import { FeatureItem } from '@/uikit/components/FeatureItem';
import { LoginForm } from '@/uikit/components/LoginForm';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { loginI18n, NS_PAGE_LOGIN } from '@config/i18n-mapping/loginI18n';
import { ROUTE_LOGIN } from '@config/route';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import {
  AppPageRouteParams,
  type PageParamsType
} from '@server/AppPageRouteParams';
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
  const pageParams = new AppPageRouteParams(await params);

  return await pageParams.getI18nInterface(loginI18n);
}

export default async function LoginPage(props: PageParamsProps) {
  if (!props.params) {
    return notFound();
  }

  const params = await props.params;
  const pageParams = new AppPageRouteParams(params);

  const tt = await pageParams.getI18nInterface(
    { ...loginI18n, adminTitle: COMMON_ADMIN_TITLE },
    NS_PAGE_LOGIN
  );

  return (
    <AppRoutePage
      data-testid="AppRoute-LoginPage"
      tt={{
        title: tt.title,
        adminTitle: tt.adminTitle
      }}
      headerHref={ROUTE_LOGIN}
      mainProps={{
        className: 'text-xs1 bg-primary flex min-h-screen'
      }}
    >
      <div className="hidden lg:flex bg-secondary lg:w-1/2 p-12 flex-col">
        <h1 className="text-4xl font-bold text-primary-text mb-4">
          {tt.welcome}
        </h1>
        <p className="text-secondary-text text-lg mb-8">{tt.subtitle}</p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={tt.feature_ai_paths} />
          <FeatureItem icon="🎯" text={tt.feature_smart_recommendations} />
          <FeatureItem icon="📊" text={tt.feature_progress_tracking} />
        </div>
      </div>

      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-primary-text">
            {tt.title}
          </h2>
          <p className="text-secondary-text mb-8">{tt.subtitle}</p>

          <LoginForm tt={tt} />
        </div>
      </div>
    </AppRoutePage>
  );
}
