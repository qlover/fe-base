import { redirect, RedirectType } from 'next/navigation';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { OAuthAuthorizeErrorCard } from '@/uikit/components-app/oauth/OAuthAuthorizeErrorCard';
import { PageI18nProvider } from '@/uikit/context/PageI18nContext';
import { i18nConfig } from '@config/i18n';
import { oauthAuthorizeI18n } from '@config/i18n-mapping/OAuthAuthorizeI18n';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import { OAuthController } from '@server/controllers/OAuthController';
import { NextApiServer } from '@server/NextApiServer';
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
  return await pageParams.getI18nInterface(oauthAuthorizeI18n);
}

type OAuthAuthorizePageProps = PageParamsProps & {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OAuthAuthorizePage(
  props: OAuthAuthorizePageProps
) {
  const params = await props.params!;
  const pageParams = new AppPageRouteParams(params);
  const tt = await pageParams.getI18nInterface(oauthAuthorizeI18n);

  const rawSearchParams = (await props.searchParams) ?? {};
  const nextApi = new NextApiServer('OAuthAuthorizePage');

  const oauthContoller = nextApi.getIOC(OAuthController);

  const authorizeData = await nextApi.run(async () =>
    oauthContoller.resolveAuthorizePage(rawSearchParams)
  );

  if (authorizeData.success) {
    if (authorizeData.data?.redirectUrl) {
      return redirect(
        authorizeData.data?.redirectUrl.toString(),
        RedirectType.replace
      );
    }
  }

  return (
    <PageI18nProvider value={tt}>
      <AppRoutePage
        data-testid="AppRoute-OAuthAuthorizePage"
        tt={{ title: tt.title, adminTitle: tt.adminTitle }}
        showAuthButton={false}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center px-4 py-12">
            {!authorizeData.success ? (
              <OAuthAuthorizeErrorCard
                heading={authorizeData.id}
                message={authorizeData.message}
              />
            ) : null}
          </div>

          <footer className="text-center text-sm text-secondary-text py-6 border-t border-primary-border">
            <p>
              © 2026 {tt.title} · {tt.footerTagline}
            </p>
          </footer>
        </div>
      </AppRoutePage>
    </PageI18nProvider>
  );
}
