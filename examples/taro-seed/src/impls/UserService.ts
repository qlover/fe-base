import { fetchLogout, fetchUserInfo, fetchWxLogin } from './AppRequester';
import type { AuthStore } from '@/stores/authStore';
import type {
  UserServiceInterface,
  UserStoreInterface
} from '@qlover/corekit-bridge';
import type {
  UserCredentialSchema,
  UserSchema
} from 'types/schemas/UserSchema';

export class UserService implements UserServiceInterface<
  UserSchema,
  UserCredentialSchema,
  string
> {
  constructor(protected authStore: AuthStore) {}
  /**
   * @override
   */
  public getStore(): UserStoreInterface<UserSchema, UserCredentialSchema> {
    return this.authStore;
  }
  /**
   * @override
   */
  public getUser(): UserSchema | null {
    return this.authStore.getUser();
  }
  /**
   * @override
   */
  public getCredential(): UserCredentialSchema | null {
    return this.authStore.getCredential();
  }
  /**
   * @override
   */
  public isAuthenticated(): boolean {
    return (
      this.authStore.getUser() != null &&
      this.authStore.getStatus() === 'success'
    );
  }
  /**
   * @override
   */
  public isCredential(value: unknown): value is UserCredentialSchema {
    return (
      typeof value === 'object' && value !== null && 'access_token' in value
    );
  }
  /**
   * @override
   */
  public isUser(value: unknown): value is UserSchema {
    return (
      typeof value === 'object' &&
      value !== null &&
      'userId' in value &&
      'phoneNumber' in value
    );
  }

  /*
* @override
 微信登录：先取 wx code，再调后端，成功后写入 authStore * 微信登录：先取 wx code，再调后端，成功后写入 authStore */
  public async login(
    _params: unknown,
    _config?: unknown
  ): Promise<UserCredentialSchema> {
    throw new Error('Method not implemented.');
  }

  public async loginWithCode(code: string): Promise<string> {
    this.authStore.setCode(code);
    this.authStore.start();

    const response = await fetchWxLogin(code);

    if (!response.data) {
      throw new Error('Login failed');
    }

    this.authStore.success(response.data, response.data);
    this.authStore.setCode('');

    return code;
  }

  /**
   * @override
   */
  public async logout<R = void>(
    _params?: unknown,
    _config?: string
  ): Promise<R> {
    await fetchLogout();

    this.authStore.reset();

    return undefined as R;
  }

  /**
   * @override
   */
  public register(_params: unknown, _config?: unknown): Promise<UserSchema> {
    throw new Error('Method not implemented.');
  }

  /**
   * @override
   */
  public async getUserInfo(
    _params?: unknown,
    _config?: unknown
  ): Promise<UserSchema> {
    throw new Error('Method not implemented.');
  }

  /**
   * @override
   */
  public async refreshUserInfo(
    params: UserCredentialSchema,
    _config?: string
  ): Promise<UserSchema> {
    const response = await fetchUserInfo(params.access_token);

    if (!response.data) {
      throw new Error('Refresh user info failed');
    }

    if (this.isCredential(response.data)) {
      this.authStore.success(response.data, response.data);
    } else {
      this.authStore.success(response.data, params);
    }

    return response.data;
  }
}
