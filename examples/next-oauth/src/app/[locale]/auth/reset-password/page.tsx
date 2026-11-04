import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/uikit/components/ResetPasswordForm';
import { AppRoutePage } from '@/uikit/components-app/AppRoutePage';
import { i18nConfig } from '@config/i18n';
import { COMMON_ADMIN_TITLE } from '@config/i18n-identifier/common/common';
import { resetPassword18n } from '@config/i18n-mapping/passwordReset18n';
import { ROUTE_AUTH_RESET_PASSWORD } from '@config/route';
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

  return await pageParams.getI18nInterface(resetPassword18n);
}

/**
 * 重置密码页：邮件链接 `?token=` 进入，匿名可访问。
 * 令牌读取与校验在客户端表单内完成，页面本身保持静态。
 */
export default async function ResetPasswordPage(props: PageParamsProps) {
  if (!props.params) {
    return notFound();
  }

  const pageParams = new AppPageRouteParams(await props.params);
  const tt = await pageParams.getI18nInterface({
    ...resetPassword18n,
    adminTitle: COMMON_ADMIN_TITLE
  });

  return (
    <AppRoutePage
      data-testid="AppRoute-ResetPasswordPage"
      tt={{
        title: tt.title,
        adminTitle: tt.adminTitle
      }}
      showHeaderNav={false}
      showAuthButton={false}
      headerHref={ROUTE_AUTH_RESET_PASSWORD}
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
          <Suspense
            fallback={
              <p className="text-secondary-text text-sm">{tt.verifying}</p>
            }
          >
            <ResetPasswordForm tt={tt} />
          </Suspense>
        </div>
      </div>
    </AppRoutePage>
  );
}
