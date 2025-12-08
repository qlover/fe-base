import type { UserInfo, UserCredential } from '@/base/apis/userApi/UserApiType';
import type { RouteServiceInterface } from '../port/RouteServiceInterface';
import type { UserServicePluginInterface } from '@qlover/corekit-bridge';

export class UserGatewayPlugin
  implements UserServicePluginInterface<UserInfo, UserCredential>
{
  readonly pluginName = 'UserGatewayPlugin';

  constructor(protected routerService: RouteServiceInterface) {}

  onLogoutSuccess(): void {
    this.routerService.reset();
    this.routerService.gotoLogin();
  }
}
