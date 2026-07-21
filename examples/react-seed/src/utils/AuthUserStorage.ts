import { UserStateInterface } from '@qlover/corekit-bridge';
import { StorageInterface } from '@qlover/fe-corekit/storage';
import {
  UserSchema,
  UserCredential,
  isUserCredential
} from '@/interfaces/schema/UserSchema.types';

export type AuthPersistSnapshot = Partial<
  UserStateInterface<UserSchema, UserCredential>
>;

/**
 * Cookie-backed {@link StorageInterface} for auth persist snapshots.
 *
 * Writes only the credential as a compact cookie string; reads back as
 * `{ credential }` (also accepts legacy plain-token / JSON cookies).
 */
export class AuthUserStorage implements StorageInterface<
  string,
  AuthPersistSnapshot
> {
  constructor(private readonly cookies: StorageInterface<string, string>) {}

  /**
   * @override
   */
  public setItem(key: string, value: AuthPersistSnapshot): void {
    const credential = value?.credential;
    if (!isUserCredential(credential)) {
      this.cookies.removeItem(key);
      return;
    }

    const serialized = credential.refresh_token
      ? JSON.stringify(credential)
      : credential.token;
    this.cookies.setItem(key, serialized);
  }

  /**
   * @override
   */
  public getItem(key: string): AuthPersistSnapshot | null;
  /**
   * @override
   */
  public getItem(
    key: string,
    defaultValue: AuthPersistSnapshot
  ): AuthPersistSnapshot | null;
  /**
   * @override
   */
  public getItem(
    key: string,
    defaultValue?: AuthPersistSnapshot
  ): AuthPersistSnapshot | null {
    const raw = this.cookies.getItem(key);
    if (raw == null) {
      return defaultValue ?? null;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isUserCredential(parsed)) {
        return { credential: parsed };
      }
      if (
        parsed &&
        typeof parsed === 'object' &&
        'credential' in parsed &&
        isUserCredential((parsed as AuthPersistSnapshot).credential)
      ) {
        return parsed as AuthPersistSnapshot;
      }
    } catch {
      /* legacy plain token string */
    }

    return { credential: { token: raw } };
  }

  /**
   * @override
   */
  public removeItem(key: string): void {
    this.cookies.removeItem(key);
  }

  /**
   * @override
   */
  public clear(): void {
    this.cookies.clear();
  }
}
