import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/base/port/PaginationInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { UserRepository } from '../repositorys/UserRepository';
import { PaginationValidator } from '../validators/PaginationValidator';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';
import type { ValidatorInterface } from '../port/ValidatorInterface';

@injectable()
export class ApiUserService {
  constructor(
    @inject(UserRepository)
    protected userRepository: UserRepositoryInterface,
    @inject(PaginationValidator)
    protected paginationValidator: ValidatorInterface
  ) {}

  async getUsers(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<UserSchema>> {
    const result = await this.userRepository.pagination(params);

    return result as PaginationInterface<UserSchema>;
  }
}
