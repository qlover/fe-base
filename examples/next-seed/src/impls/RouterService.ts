import { RouterService as KitRouterService } from '@qlover/next-kit/client';
import { inject, injectable } from '@shared/container';
import { URLParamsKeys, type LoginReasonType } from '@config/common';
import { ROUTE_HOME, ROUTE_LOGIN } from '@config/route';
import type {
  RouterInterface,
  RouterPathname
} from '@interfaces/RouterInterface';
import { NavigateBridge } from './NavigateBridge';
import type { UIBridgeInterface } from '@qlover/corekit-bridge';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

@injectable()
export class RouterService extends KitRouterService implements RouterInterface {
  constructor(
    @inject(NavigateBridge)
    uiBridge: UIBridgeInterface<AppRouterInstance>
  ) {
    super(uiBridge, { homePath: ROUTE_HOME, loginPath: ROUTE_LOGIN });
  }

  /**
   * @override
   */
  public override goto(href: RouterPathname | string): void {
    super.goto(href as string);
  }

  /**
   * 跳转登录页；带原因时（如会话过期）附上原因与当前地址，
   * 登录页据此展示提示，登录后回到原页面。
   *
   * @param reason - 可选登录原因
   */
  public override gotoLogin(reason?: LoginReasonType): void {
    if (reason == null) {
      super.gotoLogin();
      return;
    }
    const { pathname, search, hash } = window.location;
    const params = new URLSearchParams();
    params.set(URLParamsKeys.loginReason, reason);
    params.set(URLParamsKeys.returnTo[0], `${pathname}${search}${hash}`);
    this.goto(`${ROUTE_LOGIN}?${params.toString()}`);
  }
}
