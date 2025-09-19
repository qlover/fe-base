import type { DBTableInterface } from '@/server/port/DBTableInterface';
import type { UserSchema } from '@migrations/schema/UserSchema';

export interface UserRepositoryInterface extends DBTableInterface {
  getUserByEmail(email: string): Promise<UserSchema | null>;
  add(params: {
    email: string;
    password: string;
  }): Promise<UserSchema[] | null>;

  updateById(
    id: number,
    params: Partial<Omit<UserSchema, 'id' | 'created_at'>>
  ): Promise<void>;
}
