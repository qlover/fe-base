import { AsyncStore } from '../../store-state';
import type { RegisterInterface } from '../interface/base/RegisterInterface';
import type { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { GatewayService } from './GatewayService';
import { ServiceAction } from './ServiceAction';

export class RegisterService<
    Result,
    Store extends AsyncStore<Result, string> = AsyncStore<Result, string>
  >
  extends GatewayService<Result, RegisterInterface<Result>, Store>
  implements RegisterServiceInterface<Result, Store>
{
  /**
   * Get the user from the store
   *
   * @override
   * @returns The user from the store
   */
  public getUser(): Result | null {
    return this.store.getResult();
  }

  public async register<Params>(params: Params): Promise<Result | null> {
    return this.execute(ServiceAction.REGISTER, params);
  }
}
