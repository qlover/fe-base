import { redirect } from '@/i18n/routing';
import type { PageLayoutProps } from '@interfaces/AppPageRouter';
import { BootstrapServer } from '@server/BootstrapServer';
import { AppPageRouteParams } from '@server/render/AppPageRouteParams';
import { OAuthUserService } from '@server/services/OAuthUserService';

export default async function AuthLayout(props: PageLayoutProps) {
  const pageParams = new AppPageRouteParams(await props.params!);
  const locale = pageParams.getLocale();
  const IOC = new BootstrapServer().getIOC();

  if (await IOC(OAuthUserService).hasAuth()) {
    return redirect({ href: '/', locale: locale });
  }

  return props.children;
}
