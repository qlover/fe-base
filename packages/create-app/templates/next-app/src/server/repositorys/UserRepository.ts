import { inject, injectable } from 'inversify';
import { isEmpty, last } from 'lodash';
import type { DBBridgeInterface } from '@/server/port/DBBridgeInterface';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { I } from '@config/IOCIdentifier';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';

@injectable()
export class UserRepository implements UserRepositoryInterface {
  public readonly name = 'fe_users';

  protected safeFields = [
    'created_at',
    // 'credential_token',
    'email',
    'email_confirmed_at',
    'id',
    // 'password',
    'role',
    'updated_at'
  ];

  constructor(
    @inject(I.DBBridgeInterface) protected dbBridge: DBBridgeInterface
  ) {}

  public getAll(): Promise<unknown> {
    return this.dbBridge.get({ table: this.name });
  }

  /**
   * @override
   */
  public async getUserByEmail(email: string): Promise<UserSchema | null> {
    const result = await this.dbBridge.get({
      table: this.name,
      where: [['email', '=', email]]
    });

    if (isEmpty(result.data)) {
      return null;
    }

    return last(result.data as UserSchema[]) ?? null;
  }

  /**
   * @override
   */
  public async add(params: {
    email: string;
    password: string;
  }): Promise<UserSchema[] | null> {
    const result = await this.dbBridge.add({
      table: this.name,
      data: params
    });

    if (isEmpty(result.data)) {
      return null;
    }

    return result.data as UserSchema[];
  }

  public async updateById(
    id: number,
    params: Partial<Omit<UserSchema, 'id' | 'created_at'>>
  ): Promise<void> {
    await this.dbBridge.update({
      table: this.name,
      data: params,
      where: [['id', '=', id]]
    });
  }

  public async pagination<UserSchema>(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<UserSchema>> {
    const result = await this.dbBridge.pagination({
      table: this.name,
      page: params.page,
      pageSize: params.pageSize,
      fields: this.safeFields
    });

    return {
      list: result.data as UserSchema[],
      total: result.count ?? 0,
      page: params.page,
      pageSize: params.pageSize
    };
  }
}
