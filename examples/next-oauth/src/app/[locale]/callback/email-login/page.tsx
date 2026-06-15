/**
 * ─── Email OTP / Magic Link 登录回调页面（服务端组件） ───
 *
 * 触发场景：
 *   用户在登录页输入邮箱后，Supabase 发送一封 Magic Link 邮件。
 *   用户点击邮件中的链接，Supabase 验证 token 后将浏览器重定向到本页面，
 *   并在 URL 的 hash fragment（#）中附带 auth tokens。
 *
 * 为什么需要前端处理：
 *   URL hash fragment（#access_token=...）**永远不会**发送到服务端，
 *   所以必须在客户端 JavaScript 中读取并处理。
 *
 * 处理流程：
 *   1. 读取 location.hash，解析出 access_token / refresh_token 等参数
 *   2. 调用 supabase.auth.setSession() 将 Supabase auth cookie 写入浏览器
 *   3. POST API_AUTH_EMAIL_OTP_ESTABLISH —— 通知后端建立应用级 session
 *   4. 跳转到 /developer/apps（登录成功后的首页）
 *
 * 错误处理：
 *   如果 Supabase 返回 #error=... 或缺少必要 token，则跳转回登录页。
 *
 * 相关页面（未来可扩展）：
 *   - /auth/email-verify-callback  —— 邮箱验证回调
 *   - /auth/register-success       —— 注册成功
 *   - /auth/register-error         —— 注册失败
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
