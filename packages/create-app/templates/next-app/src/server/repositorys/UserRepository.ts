import { inject, injectable } from 'inversify';
import { isEmpty, last } from 'lodash';
import type { DBBridgeInterface } from '@/base/port/DBBridgeInterface';
import { SupabaseBridge } from '../SupabaseBridge';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';

@injectable()
export class UserRepository implements UserRepositoryInterface {
  readonly name = 'fe_users';

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
}
