import {
  createGatewayResultFailed,
  createGatewayResultSuccess,
  type GatewayResult,
  UserServiceInterface,
  UserStoreInterface
} from '@qlover/corekit-bridge';
import { ExecutorError } from '@qlover/fe-corekit';
import type { AuthStore } from '@/stores/authStore';
import type { UserCredentialSchema, UserSchema } from '@schemas/UserSchema';

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

  /**
   * @override
   */
  public async login(
    _params: unknown,
    _config?: unknown
  ): Promise<GatewayResult<UserCredentialSchema>> {
    return createGatewayResultFailed(
      new ExecutorError('NOT_IMPLEMENTED', 'Method not implemented.')
    );
  }

  /**
   * WeChat login: exchange wx code via backend, then persist to authStore.
   */
  public async loginWithCode(code: string): Promise<string> {
    this.authStore.setCode(code);
    this.authStore.start();

    const { fetchWxLogin } = await import('./AppRequester');
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
    const { fetchLogout } = await import('./AppRequester');
    await fetchLogout();

    this.authStore.reset();

    return undefined as R;
  }

  /**
   * @override
   */
  public async register(
    _params: unknown,
    _config?: unknown
  ): Promise<GatewayResult<UserSchema>> {
    return createGatewayResultFailed(
      new ExecutorError('NOT_IMPLEMENTED', 'Method not implemented.')
    );
  }

  /**
   * @override
   */
  public async getUserInfo(
    _params?: unknown,
    _config?: unknown
  ): Promise<GatewayResult<UserSchema>> {
    return createGatewayResultFailed(
      new ExecutorError('NOT_IMPLEMENTED', 'Method not implemented.')
    );
  }

  /**
   * @override
   */
  public async refreshUserInfo(
    params?: unknown,
    _config?: string
  ): Promise<GatewayResult<UserSchema>> {
    if (!this.isCredential(params)) {
      return createGatewayResultFailed(
        new ExecutorError(
          'INVALID_CREDENTIAL',
          'refreshUserInfo requires a valid credential'
        )
      );
    }

    const { fetchUserInfo } = await import('./AppRequester');
    const response = await fetchUserInfo(params.access_token);

    if (!response.data) {
      return createGatewayResultFailed(
        new ExecutorError('REFRESH_FAILED', 'Refresh user info failed')
      );
    }

    if (this.isCredential(response.data)) {
      const credential = response.data;
      this.authStore.success(credential, credential);
    } else {
      this.authStore.success(response.data, params);
    }

    return createGatewayResultSuccess(response.data);
  }
}
