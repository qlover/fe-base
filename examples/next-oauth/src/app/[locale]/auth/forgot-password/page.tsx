import { notFound } from 'next/navigation';
import { ForgotPasswordForm } from '@/uikit/components/ForgotPasswordForm';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { forgotPassword18n } from '@config/i18n-mapping/passwordReset18n';
import { ROUTE_AUTH_FORGOT_PASSWORD } from '@config/route';
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

  return await pageParams.getI18nInterface(forgotPassword18n);
}

/**
 * 忘记密码页：匿名可访问，已登录用户由 `GUEST_ONLY_AUTH_PAGES` 重定向。
 */
export default async function ForgotPasswordPage(props: PageParamsProps) {
  if (!props.params) {
    return notFound();
  }

  const pageParams = new AppPageRouteParams(await props.params);
  const tt = await pageParams.getI18nInterface({
    ...forgotPassword18n,
    adminTitle: COMMON_ADMIN_TITLE
  });

  return (
    <AppRoutePage
      data-testid="AppRoute-ForgotPasswordPage"
      tt={{
        title: tt.title,
        adminTitle: tt.adminTitle
      }}
      showHeaderNav={false}
      showAuthButton={false}
      headerHref={ROUTE_AUTH_FORGOT_PASSWORD}
      mainProps={{
        className: 'text-xs1 bg-primary flex min-h-screen'
      }}
    >
      <div className="flex w-full items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[420px]">
          <h2 className="text-primary-text mb-2 text-2xl font-semibold">
            {tt.title}
          </h2>
          <p className="text-secondary-text mb-6 text-sm leading-relaxed">
            {tt.description}
          </p>
          <ForgotPasswordForm tt={tt} />
        </div>
      </div>
    </AppRoutePage>
  );
}
