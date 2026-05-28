import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { FeatureItem } from '@/uikit/components/FeatureItem';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { LoginForm } from '@/uikit/components/LoginForm';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { loginI18n, NS_PAGE_LOGIN } from '@config/i18n-mapping/loginI18n';
import {
  ROUTE_DOCS_OAUTH,
  ROUTE_LOGIN,
  ROUTE_OAUTH_PLAYGROUND
} from '@config/route';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import {
  AppPageRouteParams,
  type PageParamsType
} from '@server/render/AppPageRouteParams';
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
      showHeaderNav={false}
      showAuthButton={false}
      headerHref={ROUTE_LOGIN}
      mainProps={{
        className: 'text-xs1 bg-primary flex min-h-screen'
      }}
    >
      <div className="hidden lg:flex bg-secondary lg:w-1/2 flex-col p-12">
        <span className="border-primary-border text-brand mb-4 inline-flex w-fit items-center rounded-full border bg-bg-container px-3 py-1 text-xs font-semibold tracking-wide uppercase">
          OAuth 2.0
        </span>
        <p className="text-secondary-text mb-6 text-sm font-medium">
          {tt.badge}
        </p>
        <h1 className="text-primary-text mb-4 text-4xl font-bold">
          {tt.welcome}
        </h1>
        <p className="text-secondary-text mb-8 text-lg leading-relaxed">
          {tt.subtitle}
        </p>
        <div className="space-y-4">
          <FeatureItem icon="🔐" text={tt.feature_ai_paths} />
          <FeatureItem icon="🔌" text={tt.feature_smart_recommendations} />
          <FeatureItem icon="🧪" text={tt.feature_progress_tracking} />
        </div>
        <p className="text-tertiary-text mt-10 text-sm leading-relaxed">
          {tt.demoNote}
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-8 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <span className="border-primary-border text-brand mb-3 inline-flex items-center rounded-full border bg-bg-container px-3 py-1 text-xs font-semibold tracking-wide uppercase">
              OAuth 2.0
            </span>
            <p className="text-secondary-text text-sm">{tt.badge}</p>
          </div>
          <h2 className="text-primary-text mb-2 text-2xl font-semibold">
            {tt.title}
          </h2>
          <p className="text-secondary-text mb-6 text-sm leading-relaxed">
            {tt.formSubtitle}
          </p>

          <Suspense
            fallback={
              <p className="text-secondary-text text-sm">{tt.formSubtitle}</p>
            }
          >
            <LoginForm tt={tt} />
          </Suspense>

          <p className="text-tertiary-text mt-8 text-center text-xs leading-relaxed">
            <LocaleLink
              href={ROUTE_DOCS_OAUTH}
              className="text-brand hover:underline"
            >
              {tt.linkDocs}
            </LocaleLink>
            {' · '}
            <LocaleLink
              href={ROUTE_OAUTH_PLAYGROUND}
              className="text-brand hover:underline"
            >
              {tt.linkPlayground}
            </LocaleLink>
          </p>
        </div>
      </div>
    </AppRoutePage>
  );
}
