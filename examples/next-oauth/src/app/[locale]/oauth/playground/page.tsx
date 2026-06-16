import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { OAuthPlayground } from '@/uikit/components-app/oauth/OAuthPlayground';
import { PageI18nProvider } from '@/uikit/context/PageI18nContext';
import { i18nConfig } from '@config/i18n';
import {
  oauthPlaygroundI18n,
  oauthPlaygroundI18nNamespace
} from '@config/i18n-mapping/oauthPlaygroundI18n';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import {
  AppPageRouteParams,
  type PageParamsType
} from '@server/render/AppPageRouteParams';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<PageParamsType>;
}): Promise<Metadata> {
  const pageParams = new AppPageRouteParams(await params);
  return await pageParams.getI18nInterface(oauthPlaygroundI18n);
}

type OAuthPlaygroundPageProps = PageParamsProps;

export default async function OAuthPlaygroundPage(
  props: OAuthPlaygroundPageProps
) {
  const params = await props.params!;
  const pageParams = new AppPageRouteParams(params);
  const tt = await pageParams.getI18nInterface(
    oauthPlaygroundI18n,
    oauthPlaygroundI18nNamespace
  );

  return (
    <PageI18nProvider value={tt}>
      <AppRoutePage
        data-testid="AppRoute-OAuthPlaygroundPage"
        tt={{ title: tt.title, adminTitle: tt.adminTitle }}
        showAuthButton
        authButtonShowLogoutLabel
        mainProps={{ className: 'flex flex-1 flex-col bg-primary' }}
      >
        <OAuthPlayground />
      </AppRoutePage>
    </PageI18nProvider>
  );
}
