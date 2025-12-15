import { inject, injectable } from 'inversify';

import type { UserSchema } from '@migrations/schema/UserSchema';
import { UserRepository } from '../repositorys/UserRepository';
import { ApiUserService } from '../services/ApiUserService';
import { PaginationValidator } from '../validators/PaginationValidator';
import type { AdminUserControllerInterface } from '../port/AdminUserControllerInterface';
import type { BridgeOrderBy } from '../port/DBBridgeInterface';
import type { PaginationInterface } from '../port/PaginationInterface';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';
import type { ValidatorInterface } from '../port/ValidatorInterface';
import type { PaginationParams } from '../validators/PaginationValidator';

@injectable()
export class AdminUserController implements AdminUserControllerInterface {
  constructor(
    @inject(UserRepository)
    protected userRepository: UserRepositoryInterface,
    @inject(PaginationValidator)
    protected paginationValidator: ValidatorInterface<PaginationParams>,
    @inject(ApiUserService)
    protected apiUserService: ApiUserService
  ) {}

  /**
   * @override
   */
  public async getUsers(query: {
    page: number;
    pageSize: number;
    orderBy?: BridgeOrderBy;
  }): Promise<PaginationInterface<UserSchema>> {
    const paginationParams = await this.paginationValidator.getThrow(query);

    const result = await this.apiUserService.getUsers({
      page: paginationParams.page,
      pageSize: paginationParams.pageSize
    });

    return result;
  }
}
