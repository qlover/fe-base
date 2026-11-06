import type { LoginProviderType } from '@config/common';
import type { ChangePasswordInput } from '@schemas/ChangePasswordSchema';
import type { SessionCapabilitiesStoreInterface } from '@interfaces/SessionCapabilitiesInterface';
import type {
  UserService as CorekitBridgeUserServiceInterface,
  GatewayResult,
  LoginParams,
  UserServiceGateway
} from '@qlover/corekit-bridge';
import type { UserCredential, UserSchema } from '@qlover/next-kit/common';
import type { SignOtpResult, SignWithOtpParams } from '@qlover/oauth-wrapper';

export type LoginProviderResult = {
  providerUrl: string;
  provider: string;
};

export interface UserServiceInterface
  extends
    CorekitBridgeUserServiceInterface<UserSchema, UserCredential>,
    SessionCapabilitiesStoreInterface {
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

export type OAuthConsentPayload = {
  action: 'allow' | 'deny';
  client_id: string;
  redirect_uri: string;
  scope?: string;
  state?: string;
  trust?: boolean;
  code_challenge?: string;
  code_challenge_method?: 'S256';
};

export interface UserServiceGatewayInterface extends UserServiceGateway<
  UserSchema,
  UserCredential,
  {}
> {
  /**
   * 主要用于 OAuth 验证登陆
   *
   * 只是登陆接口的一个别名
   *
   * @param params
   */
  verify(params: LoginParams): Promise<GatewayResult<UserCredential>>;

  /**
   * 主要用提交 OAuth 授权请求
   * @param payload
   */
  submitOAuthConsent(payload: OAuthConsentPayload): Promise<string>;

  sendOtp(params: SignWithOtpParams): Promise<SignOtpResult>;
  verifyOtp(
    params: { phone: string; token: string } | { email: string; token: string }
  ): Promise<SignOtpResult>;

  loginWithProvider(params: {
    provider: LoginProviderType;
  }): Promise<LoginProviderResult>;

  changePassword(params: ChangePasswordInput): Promise<void>;
}
