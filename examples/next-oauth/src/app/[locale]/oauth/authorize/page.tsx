import { PageI18nProvider } from '@qlover/next-kit/client';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { OAuthAuthorizeCard } from '@/uikit/components-app/oauth/OAuthAuthorizeCard';
import { OAuthAuthorizeErrorCard } from '@/uikit/components-app/oauth/OAuthAuthorizeErrorCard';
import { i18nConfig, type LocaleType } from '@config/i18n';
import {
  oauthAuthorizeI18n,
  oauthAuthorizeI18nNamespace,
  resolveAuthorizeErrorMessage
} from '@config/i18n-mapping/OAuthAuthorizeI18n';
import { localePage, ROUTE_LOGIN, ROUTE_OAUTH_AUTHORIZE } from '@config/route';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import { BootstrapServer } from '@server/BootstrapServer';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
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

function toSearchString(
  query: Record<string, string | string[] | undefined>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        search.append(key, item);
      }
    }
  }
  return search.toString();
}

export default async function OAuthAuthorizePage(
  props: OAuthAuthorizePageProps
) {
  const params = await props.params!;
  const pageParams = new AppPageRouteParams(params);
  const tt = await pageParams.getI18nInterface(
    oauthAuthorizeI18n,
    oauthAuthorizeI18nNamespace
  );

  const rawSearchParams = (await props.searchParams) ?? {};
  const IOC = new BootstrapServer('OAuthAuthorizePage').getIOC();
  const oauthContoller = IOC(OAuthWrapperController);
  const authorizeResult =
    await oauthContoller.resolveAuthorizePage(rawSearchParams);

  if (authorizeResult.ok) {
    const trustedRedirect = await oauthContoller.tryAutoConsent(
      authorizeResult.data
    );
    if (trustedRedirect) {
      redirect(trustedRedirect);
    }
  }

  const account = authorizeResult.ok
    ? await oauthContoller.getAuthorizingUser()
    : null;
  const locale = pageParams.getLocale() as LocaleType;
  const authorizePath = `${localePage(ROUTE_OAUTH_AUTHORIZE, locale)}?${toSearchString(rawSearchParams)}`;
  const switchAccountHref = `${localePage(ROUTE_LOGIN, locale)}?redirect=${encodeURIComponent(authorizePath)}`;

  return (
    <PageI18nProvider value={tt}>
      <AppRoutePage
        data-testid="AppRoute-OAuthAuthorizePage"
        tt={{ title: tt.title, adminTitle: tt.adminTitle }}
        showAuthButton={false}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center px-4 py-12">
            {authorizeResult.ok ? (
              <Suspense>
                <OAuthAuthorizeCard
                  tt={tt}
                  authorizeData={authorizeResult.data}
                  account={
                    account
                      ? {
                          name: account.name,
                          email: account.email,
                          phone: account.phone
                        }
                      : null
                  }
                  switchAccountHref={switchAccountHref}
                />
              </Suspense>
            ) : (
              <OAuthAuthorizeErrorCard
                tt={tt}
                message={resolveAuthorizeErrorMessage(
                  tt,
                  authorizeResult.error.errorKey,
                  authorizeResult.error.message
                )}
              />
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
