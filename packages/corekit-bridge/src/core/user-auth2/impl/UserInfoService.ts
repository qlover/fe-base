import { AsyncStore } from '../../store-state';
import type { UserInfoInterface } from '../interface/base/UserInfoInterface';
import type { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { BaseGatewayService } from './BaseGatewayService';

export class UserInfoService<User, Store extends AsyncStore<User, string>>
  extends BaseGatewayService<User, UserInfoInterface<User>, Store>
  implements UserInfoServiceInterface<User, Store>
{
  getUser(): User | null {
    return this.store.getResult();
  }

  async getUserInfo<Params>(params?: Params): Promise<User | null> {
    return this.execute('getUserInfo', params);
  }

  async refreshUserInfo<Params>(params?: Params): Promise<User | null> {
    return this.execute('refreshUserInfo', params);
  }
}
