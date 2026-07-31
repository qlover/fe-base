import { RouterService as KitRouterService } from '@qlover/next-kit/client';
import { inject, injectable } from '@shared/container';
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
}
