import { inject, injectable } from 'inversify';
import { isEmpty, last } from 'lodash';
import type { DBBridgeInterface } from '@/server/port/DBBridgeInterface';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';
import { SupabaseBridge } from '../SupabaseBridge';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';

@injectable()
export class UserRepository implements UserRepositoryInterface {
  readonly name = 'fe_users';

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

  constructor(@inject(SupabaseBridge) protected dbBridge: DBBridgeInterface) {}

  getAll(): Promise<unknown> {
    return this.dbBridge.get({ table: this.name });
  }

  /**
   * @override
   */
  async getUserByEmail(email: string): Promise<UserSchema | null> {
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
  async add(params: {
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

  async updateById(
    id: number,
    params: Partial<Omit<UserSchema, 'id' | 'created_at'>>
  ): Promise<void> {
    await this.dbBridge.update({
      table: this.name,
      data: params,
      where: [['id', '=', id]]
    });
  }

  async pagination<UserSchema>(params: {
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
