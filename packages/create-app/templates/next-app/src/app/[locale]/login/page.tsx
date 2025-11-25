import { notFound } from 'next/navigation';
import type { PageParamsProps } from '@/base/types/PageProps';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { redirect } from '@/i18n/routing';
import { PageParams, type PageParamsType } from '@/server/PageParams';
import { ServerAuth } from '@/server/ServerAuth';
import { BaseLayout } from '@/uikit/components/BaseLayout';
import { FeatureItem } from '@/uikit/components/FeatureItem';
import { loginI18n, i18nConfig } from '@config/i18n';
import { LoginForm } from './LoginForm';
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
  const pageParams = new PageParams(await params);

  return await pageParams.getI18nInterface(loginI18n);
}

export default async function LoginPage(props: PageParamsProps) {
  if (!props.params) {
    return notFound();
  }

  const params = await props.params;
  const pageParams = new PageParams(params);

  const server = new BootstrapServer();

  if (await server.getIOC(ServerAuth).hasAuth()) {
    return redirect({ href: '/', locale: params.locale! });
  }

  const tt = await pageParams.getI18nInterface(loginI18n);

  return (
    <BaseLayout
      data-testid="LoginPage"
      mainProps={{
        className: 'text-xs1 bg-primary flex min-h-screen'
      }}
    >
      <div className="hidden lg:flex bg-secondary lg:w-1/2 p-12 flex-col">
        <h1 className="text-4xl font-bold text-text mb-4">{tt.welcome}</h1>
        <p className="text-text-secondary text-lg mb-8">{tt.subtitle}</p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={tt.feature_ai_paths} />
          <FeatureItem icon="🎯" text={tt.feature_smart_recommendations} />
          <FeatureItem icon="📊" text={tt.feature_progress_tracking} />
        </div>
      </div>

      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">{tt.title}</h2>
          <p className="text-text-secondary mb-8">{tt.subtitle}</p>

          <LoginForm tt={tt} />
        </div>
      </div>
    </BaseLayout>
  );
}
