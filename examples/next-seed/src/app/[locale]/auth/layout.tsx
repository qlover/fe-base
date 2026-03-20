import { redirect } from '@/i18n/routing';
import type { PageLayoutProps } from '@interfaces/AppPageRouter';
import { BootstrapServer } from '@server/BootstrapServer';
import { AppPageRouteParams } from '@server/render/AppPageRouteParams';
import { ServerAuth } from '@server/services/ServerAuth';

export default async function AuthLayout(props: PageLayoutProps) {
  const pageParams = new AppPageRouteParams(await props.params!);
  const locale = pageParams.getLocale();
  const IOC = new BootstrapServer().getIOC();

  // If user is already logged in, redirect to home page
  if (await IOC(ServerAuth).hasAuth()) {
    console.info('> User already logged in, redirecting to home page');

    return redirect({ href: '/', locale: locale });
  }

  return props.children;
}
