import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import {
  HomeApiSnippet,
  HomeArchitecture,
  HomeCta,
  HomeFeatures,
  HomeFooter,
  HomeHero
} from '@/uikit/components-app/home/HomeSections';
import { PageI18nProvider } from '@/uikit/context/PageI18nContext';
import { i18nConfig } from '@config/i18n';
import { homeI18n, homeI18nNamespace } from '@config/i18n-mapping/HomeI18n';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import {
  getI18nInterface,
  getLocale,
  type PageParamsType
} from '@server/render/pageRouteParams';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }));
}

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
    <PageI18nProvider value={tt}>
      <AppRoutePage
        tt={tt}
        showAuthButton
        authButtonLoginOnly
        authButtonShowLogoutLabel
      >
        <HomeHero tt={tt} />
        <HomeArchitecture tt={tt} />
        <HomeFeatures tt={tt} />
        <HomeApiSnippet tt={tt} />
        <HomeCta tt={tt} />
        <HomeFooter tt={tt} />
      </AppRoutePage>
    </PageI18nProvider>
  );
}
