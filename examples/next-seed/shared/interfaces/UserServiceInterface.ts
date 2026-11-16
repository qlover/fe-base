import type { LoginProviderType } from '@config/common';
import type { UserScopedResettableInterface } from '@interfaces/UserScopedResettableInterface';
import type {
  SignOtpResult,
  SignWithOtpParams
} from '@server/interfaces/AuthTypes';
import type {
  UserService as CorekitBridgeUserServiceInterface,
  UserServiceGateway
} from '@qlover/corekit-bridge';
import type { UserCredential, UserSchema } from '@qlover/next-kit/common';

export type { SignOtpResult, SignWithOtpParams };

export type LoginProviderResult = {
  providerUrl: string;
  provider: string;
};

export interface UserServiceInterface
  extends
    CorekitBridgeUserServiceInterface<UserSchema, UserCredential>,
    UserScopedResettableInterface {
  /**
   * Get the user token
   *
   * This is a extends method from the corekit-bridge UserServiceInterface.
   */
  getToken(): string;

  /**
   * 等待会话恢复结束；已登录或恢复成功返回 true。
   */
  awaitSessionReady(): Promise<boolean>;

  /**
   * 本地会话失效：清空用户 store（触发用户作用域重置），标记会话已确认。
   */
  expireSession(): void;

  /**
   * 用服务端返回的会话用户覆盖本地 store。
   */
  applySessionUser(user: UserSchema): void;
}

export interface UserServiceGatewayInterface extends UserServiceGateway<
  UserSchema,
  UserCredential,
  {}
> {
  sendOtp(params: SignWithOtpParams): Promise<SignOtpResult>;
  verifyOtp(
    params: { phone: string; token: string } | { email: string; token: string }
  ): Promise<SignOtpResult>;

  loginWithProvider(params: {
    provider: LoginProviderType;
  }): Promise<LoginProviderResult>;
}
