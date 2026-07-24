/**
 * ─── Email OTP / Magic Link 登录回调页面（服务端组件） ───
 *
 * 新邮件链接（PKCE）默认跳到 GET /api/callback/email-login?code=...。
 * 本页面仍作为兜底：处理指向此处的 ?code= 或旧的 #access_token hash。
 */

import { notFound } from 'next/navigation';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import {
  emailOtpCallbackI18n,
  NS_PAGE_EMAIL_OTP_CALLBACK
} from '@config/i18n-mapping/emailOtpCallbackI18n';
import { ROUTE_LOGIN } from '@config/route';
import type { PageParamsProps } from '@interfaces/AppPageRouter';
import {
  AppPageRouteParams,
  type PageParamsType
} from '@server/render/AppPageRouteParams';
import { EmailOtpCallbackClient } from './EmailOtpCallbackClient';
import type { Metadata } from 'next';

// Generate static params for all supported locales (used for SSG)
export async function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }));
}

// Generate localized SEO metadata per locale
export async function generateMetadata({
  params
}: {
  params: Promise<PageParamsType>;
}): Promise<Metadata> {
  const pageParams = new AppPageRouteParams(await params);
  return await pageParams.getI18nInterface(emailOtpCallbackI18n);
}

export default async function EmailOtpCallbackPage(props: PageParamsProps) {
  if (!props.params) {
    return notFound();
  }

  const params = await props.params;
  const pageParams = new AppPageRouteParams(params);

  const tt = await pageParams.getI18nInterface(
    { ...emailOtpCallbackI18n, adminTitle: COMMON_ADMIN_TITLE },
    NS_PAGE_EMAIL_OTP_CALLBACK
  );

  return (
    <AppRoutePage
      data-testid="AppRoute-EmailOtpCallbackPage"
      tt={{
        title: tt.authenticating,
        adminTitle: tt.adminTitle
      }}
      showHeaderNav={false}
      showAuthButton={false}
      headerHref={ROUTE_LOGIN}
      mainProps={{
        className: 'text-xs1 bg-primary flex min-h-screen'
      }}
    >
      <EmailOtpCallbackClient tt={tt} />
    </AppRoutePage>
  );
}
