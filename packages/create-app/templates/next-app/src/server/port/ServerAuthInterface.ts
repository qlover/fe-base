import type { UserSchema } from '@migrations/schema/UserSchema';

export interface ServerAuthInterface {
  setAuth(credential_token: string): Promise<void>;

  getAuth(): Promise<string>;

  clear(): Promise<void>;

  hasAuth(): Promise<boolean>;

  throwIfNotAuth(): Promise<void>;

  getUser(): Promise<UserSchema | null>;
}
