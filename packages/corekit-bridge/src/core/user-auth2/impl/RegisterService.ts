import {
  AsyncStore,
  type AsyncStoreInterface,
  type AsyncStoreStateInterface
} from '../../store-state';
import type { RegisterInterface } from '../interface/base/RegisterInterface';
import type { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { BaseGatewayService } from './BaseGatewayService';

export class RegisterService<
    Result,
    Store extends AsyncStoreInterface<
      AsyncStoreStateInterface<Result>
    > = AsyncStore<Result, string>
  >
  extends BaseGatewayService<Result, RegisterInterface<Result>, Store>
  implements RegisterServiceInterface<Result, Store>
{
  /**
   * Get the user from the store
   *
   * @override
   * @returns The user from the store
   */
  public getUser(): Result | null {
    return this.getResult();
  }

  async register<Params>(params: Params): Promise<Result> {
    if (!this.gateway) {
      return Promise.resolve({} as Result);
    }

    this.store.start();

    try {
      const result = await this.gateway.register(params);
      this.store.success(result);

      return result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
  }
}
