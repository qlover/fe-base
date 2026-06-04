import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { OAuthDocsContent } from '@/uikit/components-app/docs/OAuthDocsContent';
import { PageI18nProvider } from '@/uikit/context/PageI18nContext';
import { i18nConfig } from '@config/i18n';
import {
  oauthDocsI18n,
  oauthDocsI18nNamespace
} from '@config/i18n-mapping/oauthDocsI18n';
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
  return await pageParams.getI18nInterface(oauthDocsI18n);
}

type OAuthDocsPageProps = PageParamsProps;

export default async function OAuthDocsPage(props: OAuthDocsPageProps) {
  const params = await props.params!;
  const pageParams = new AppPageRouteParams(params);
  const tt = await pageParams.getI18nInterface(
    oauthDocsI18n,
    oauthDocsI18nNamespace
  );

  return (
    <PageI18nProvider value={tt}>
      <AppRoutePage
        data-testid="AppRoute-OAuthDocsPage"
        tt={{ title: tt.title, adminTitle: tt.adminTitle }}
        showAuthButton
        authButtonLoginOnly
        mainProps={{ className: 'flex flex-1 flex-col bg-primary' }}
      >
        <OAuthDocsContent />
      </AppRoutePage>
    </PageI18nProvider>
  );
}
