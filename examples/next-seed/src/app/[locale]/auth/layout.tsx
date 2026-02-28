import { redirect } from '@/i18n/routing';
import type { PageLayoutProps } from '@interfaces/AppPageRouter';
import { AppPageRouteParams } from '@server/AppPageRouteParams';
import { ServerAuth } from '@server/ServerAuth';
import { createServerIoc } from '@server/serverIoc';

export default async function AuthLayout(props: PageLayoutProps) {
  const pageParams = new AppPageRouteParams(await props.params!);
  const locale = pageParams.getLocale();
  const IOC = createServerIoc();

  // If user is already logged in, redirect to home page
  if (await IOC(ServerAuth).hasAuth()) {
    console.info('> User already logged in, redirecting to home page');

    return redirect({ href: '/', locale: locale });
  }

  return props.children;
}
