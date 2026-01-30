import type { PageLayoutProps } from '@/base/types/AppPageRouter';
import { bootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { redirect } from '@/i18n/routing';
import { AppPageRouteParams } from '@/server/AppPageRouteParams';
import { ServerAuth } from '@/server/ServerAuth';

export default async function AuthRootPage(props: PageLayoutProps) {
  const pageParams = new AppPageRouteParams(await props.params!);
  const locale = pageParams.getLocale();

  if (await bootstrapServer.getIOC(ServerAuth).hasAuth()) {
    console.info('> User already logged in, redirecting to home page');

    return redirect({ href: '/', locale: locale });
  }

  return <>{props.children}</>;
}
