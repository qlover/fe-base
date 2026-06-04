import { redirect } from 'next/navigation';
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
  params: Promise<
    PageParamsType & {
      /**
       * 第一种情况授权id
       */
      authorization_id: string;
      /**
       * 第二种情况，返回code和state
       */
      code: string;
      state: string;
    }
  >;
}): Promise<Metadata> {
  const pageParams = new AppPageRouteParams(await params);
  return await pageParams.getI18nInterface(oauthAuthorizeI18n);
}

type OAuthConsentPageProps = PageParamsProps & {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OAuthConsentPage(props: OAuthConsentPageProps) {
  const params = await props.params!;
  const pageParams = new AppPageRouteParams(params);
  const tt = await pageParams.getI18nInterface(oauthAuthorizeI18n);

  const rawSearchParams = (await props.searchParams) ?? {};

  const nextApi = new NextApiServer('OAuthConsentPage');
  const oauthContoller = nextApi.getIOC(OAuthController);
  const consentResult = await nextApi.run(async () =>
    oauthContoller.authorizePKCECallback(rawSearchParams)
  );

  if (consentResult.success) {
    // if no authorization_id returned, user has previously consented, redirect them
    if (
      consentResult.data &&
      Object.keys(consentResult.data).length === 1 &&
      'redirect_url' in consentResult.data
    ) {
      return redirect(consentResult.data.redirect_url);
    }
  }

  return (
    <PageI18nProvider value={tt}>
      <AppRoutePage
        data-testid="AppRoute-OAuthConsentPage"
        tt={{ title: tt.title, adminTitle: tt.adminTitle }}
        showAuthButton={false}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center px-4 py-12">
            {!consentResult.success ? (
              <OAuthAuthorizeErrorCard
                heading={consentResult.id}
                message={consentResult.message}
              />
            ) : (
              <div className="text-primary-text">
                <pre>{JSON.stringify(consentResult.data, null, 2)}</pre>
              </div>
            )}
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
