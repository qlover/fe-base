import { inject, injectable } from 'inversify';
import type { DBBridgeInterface } from '@/base/port/DBBridgeInterface';
import { SupabaseBridge } from '../SupabaseBridge';
import type { UserRepositoryInterface } from '../port/UserRepositoryInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';

@injectable()
export class UserRepository implements UserRepositoryInterface {
  readonly name = 'users';

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

    if (result.error) {
      throw result.error;
    }

    return result.data as UserSchema;
  }

  /**
   * @override
   */
  async add(params: {
    email: string;
    password: string;
  }): Promise<UserSchema | null> {
    const result = await this.dbBridge.add({
      table: this.name,
      data: params
    });

    return result.data as UserSchema;
  }
}
