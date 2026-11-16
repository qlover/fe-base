import { UserService as CorekitBridgeUserService } from '@qlover/corekit-bridge';
import { inject, injectable } from '@shared/container';
import { API_REFRESH_USER_INFO_FAILED } from '@config/i18n-identifier/api';
import type { UserScopedResettableInterface } from '@interfaces/UserScopedResettableInterface';
import type {
  SignOtpResult,
  SignWithOtpParams,
  UserServiceGatewayInterface,
  UserServiceInterface
} from '@interfaces/UserServiceInterface';
import { AppUserGateway } from './AppUserGateway';
import type { AppApiConfig } from './appApi/AppApiRequester';
import type {
  SliceStoreAdapter,
  UserStateInterface
} from '@qlover/corekit-bridge';
import type { UserCredential, UserSchema } from '@qlover/next-kit/common';

/** Mirrors {@link UserRole} without importing the Zod-backed schema module. */
const USER_ROLES = new Set([0, 1]);

@injectable()
export class UserService
  extends CorekitBridgeUserService<UserSchema, UserCredential>
  implements UserServiceInterface, UserScopedResettableInterface
{
  protected pendingRefresh: Promise<boolean> | null = null;
  protected sessionSettled = false;

  constructor(
    @inject(AppUserGateway)
    userApi: UserServiceGatewayInterface
  ) {
    super(userApi, {
      pullUserWithLogin: false
    });
  }

  /**
   * @override
   */
  public override get gateway(): UserServiceGatewayInterface {
    return super.gateway as UserServiceGatewayInterface;
  }

  /**
   * @override
   */
  public getToken(): string {
    return this.getStore().getCredential()?.credential_token ?? '';
  }

  /**
   * Get the UI store instance
   *
   * UserStore 默认使用 SliceStoreAdapter 实现，所以需要返回 SliceStoreAdapter 实例
   *
   * 如果需要使用其他实现，可以重写这个方法
   *
   * @returns The UI store instance
   */
  public getUIStore(): SliceStoreAdapter<
    UserStateInterface<UserSchema, UserCredential>
  > {
    return this.getStore().getStore() as SliceStoreAdapter<
      UserStateInterface<UserSchema, UserCredential>
    >;
  }

  /**
   * @override
   */
  public isUser(value: unknown): value is UserSchema {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const user = value as Record<string, unknown>;

    return (
      typeof user.id === 'string' &&
      typeof user.role === 'number' &&
      USER_ROLES.has(user.role) &&
      typeof user.email === 'string' &&
      typeof user.credential_token === 'string' &&
      typeof user.created_at === 'string'
    );
  }

  /**
   * @override
   */
  public isCredential(value: unknown): value is UserCredential {
    return (
      typeof value === 'object' &&
      value !== null &&
      'credential_token' in value &&
      typeof value.credential_token === 'string'
    );
  }

  public refreshUser(params?: AppApiConfig): Promise<boolean> {
    if (this.isAuthenticated()) {
      return Promise.resolve(true);
    }
    if (this.pendingRefresh != null) {
      return this.pendingRefresh;
    }

    this.getStore().start();

    const pending = this.refreshUserInfo(null, params)
      .then((result) => {
        if (result && this.isUser(result.data)) {
          this.applySessionUser(result.data);
          return true;
        }

        this.getStore().failed(API_REFRESH_USER_INFO_FAILED);
        return false;
      })
      .catch((error) => {
        this.getStore().failed(error);
        return false;
      })
      .finally(() => {
        if (this.pendingRefresh === pending) {
          this.pendingRefresh = null;
        }
        this.sessionSettled = true;
      });

    this.pendingRefresh = pending;
    return pending;
  }

  /**
   * @override
   */
  public async awaitSessionReady(): Promise<boolean> {
    if (this.isAuthenticated()) {
      return true;
    }
    if (this.pendingRefresh == null && !this.sessionSettled) {
      return this.refreshUser({
        disabledDialogError: true,
        disabledLoggerError: true
      });
    }
    if (this.pendingRefresh != null) {
      await this.pendingRefresh;
    }
    return this.isAuthenticated();
  }

  /**
   * @override
   */
  public expireSession(): void {
    this.sessionSettled = true;
    this.getStore().reset();
  }

  /**
   * 用服务端返回的会话用户覆盖本地 store。
   *
   * @override
   * @param user - 嵌入会话用户
   */
  public applySessionUser(user: UserSchema): void {
    if (!this.isUser(user)) {
      return;
    }
    this.getStore().success(user, {
      credential_token: user.credential_token
    });
    this.sessionSettled = true;
  }

  /**
   * @override
   */
  public resetUserScope(): void {
    // Seed 暂无 RBAC / 权限 store；预留挂钩供后续用户作用域状态登记。
  }

  /**
   * @override
   */
  public async logout<R = void>(
    params?: unknown,
    config?: unknown
  ): Promise<R> {
    await super.logout(params, config);
    this.sessionSettled = true;
    return undefined as R;
  }

  public async sendOtp(params: SignWithOtpParams): Promise<SignOtpResult> {
    return this.gateway.sendOtp(params);
  }

  public async verifyOtp(
    params: { phone: string; token: string } | { email: string; token: string }
  ): Promise<SignOtpResult> {
    return this.gateway.verifyOtp(params);
  }
}
