import {
  AsyncStore,
  createAsyncState,
  UserService as CorekitBridgeUserService,
  type StoreInterface
} from '@qlover/corekit-bridge';
import { SignOtpResult, SignWithOtpParams } from '@qlover/oauth-wrapper';
import {
  expandSystemPermissions,
  isPlatformAdminRole,
  normalizeSystemRole,
  platformRoleFromUserRole
} from '@shared/auth/systemRole';
import { inject, injectable } from '@shared/container';
import { API_REFRESH_USER_INFO_FAILED } from '@config/i18n-identifier/api';
import type { SessionUserPermissions } from '@schemas/RoleSchema';
import type {
  SessionCapabilitiesStateInterface
} from '@interfaces/SessionCapabilitiesInterface';
import type { UserScopedResettableInterface } from '@interfaces/UserScopedResettableInterface';
import type {
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

type SessionUserType = UserSchema & Partial<SessionUserPermissions>;

function defaultCapabilitiesState(): SessionCapabilitiesStateInterface {
  return Object.assign(createAsyncState(), {
    platformAdmin: false,
    permissions: [],
    result: { platformAdmin: false, permissions: [] }
  });
}

@injectable()
export class UserService
  extends CorekitBridgeUserService<UserSchema, UserCredential>
  implements UserServiceInterface, UserScopedResettableInterface
{
  protected pendingRefresh: Promise<boolean> | null = null;
  protected sessionSettled = false;

  protected readonly capabilitiesStore: AsyncStore<
    SessionCapabilitiesStateInterface,
    string
  >;

  constructor(
    @inject(AppUserGateway)
    userApi: UserServiceGatewayInterface
  ) {
    super(userApi, {
      pullUserWithLogin: false
    });
    this.capabilitiesStore = new AsyncStore<
      SessionCapabilitiesStateInterface,
      string
    >({
      defaultState: defaultCapabilitiesState
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
  public getCapabilitiesStore(): StoreInterface<SessionCapabilitiesStateInterface> {
    return this.capabilitiesStore.getStore();
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

        this.clearSessionCapabilities();
        this.getStore().failed(API_REFRESH_USER_INFO_FAILED);
        return false;
      })
      .catch((error) => {
        this.clearSessionCapabilities();
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
    this.clearSessionCapabilities();
    this.getStore().reset();
  }

  /**
   * 用服务端返回的会话用户覆盖本地 store（例如改显示名后）。
   *
   * @param user - 嵌入会话用户
   */
  public applySessionUser(user: UserSchema): void {
    if (!this.isUser(user)) {
      return;
    }
    this.getStore().success(user, {
      credential_token: user.credential_token
    });
    this.applySessionCapabilities(user as SessionUserType);
    this.sessionSettled = true;
  }

  public applySessionCapabilities(user: SessionUserType): void {
    const permissions = this.resolvePermissions(user);
    const role = this.resolveSystemRole(user);
    const platformAdmin = isPlatformAdminRole(role);
    this.capabilitiesStore.emit({
      platformAdmin,
      permissions,
      result: { platformAdmin, permissions }
    });
  }

  public clearSessionCapabilities(): void {
    this.capabilitiesStore.emit(defaultCapabilitiesState());
  }

  /**
   * @override
   */
  public resetUserScope(): void {
    this.clearSessionCapabilities();
  }

  /**
   * @override
   */
  public async logout<R = void>(
    params?: unknown,
    config?: unknown
  ): Promise<R> {
    await super.logout(params, config);
    this.clearSessionCapabilities();
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

  protected resolveSystemRole(
    user: SessionUserType
  ): ReturnType<typeof normalizeSystemRole> {
    if (typeof user.system_role === 'string' && user.system_role.length > 0) {
      return normalizeSystemRole(user.system_role);
    }
    return platformRoleFromUserRole(user.role);
  }

  protected resolvePermissions(user: SessionUserType): string[] {
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      return [...user.permissions];
    }
    return [...expandSystemPermissions(this.resolveSystemRole(user))];
  }
}
