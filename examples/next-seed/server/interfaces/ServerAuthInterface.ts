import type { UserSchema } from '@qlover/next-kit/common';

export interface ServerAuthInterface {
  setAuth(credential_token: string): Promise<void>;

  getCredential(): Promise<string | null>;

  clear(): Promise<void>;

  hasAuth(): Promise<boolean>;

  throwIfNotAuth(): Promise<void>;

  getUser(): Promise<UserSchema | null>;
  getUser(throwError: boolean): Promise<UserSchema>;
}
