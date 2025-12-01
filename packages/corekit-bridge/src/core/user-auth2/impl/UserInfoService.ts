import {
  type AsyncStoreInterface,
  type AsyncStoreStateInterface
} from '../../store-state';
import type { UserInfoInterface } from '../interface/base/UserInfoInterface';
import type { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { BaseGatewayService } from './BaseGatewayService';

export class UserInfoService<
    User,
    Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
  >
  extends BaseGatewayService<User, UserInfoInterface<User>, Store>
  implements UserInfoServiceInterface<User, Store>
{
  getUser(): User | null {
    return this.getResult();
  }

  async getUserInfo<Params>(params?: Params): Promise<User> {
    if (!this.gateway) {
      return Promise.resolve({} as User);
    }

    this.store.start();

    try {
      const result = await this.gateway.getUserInfo(params);
      this.store.success(result);

      return result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
  }

  async refreshUserInfo<Params>(params?: Params): Promise<User> {
    return this.getUserInfo(params);
  }
}
