import type { UserCredential, UserSchema } from '@schemas/UserSchema';
import type {
  UserService as CorekitBridgeUserServiceInterface,
  LoginParams,
  UserServiceGateway
} from '@qlover/corekit-bridge';

export interface UserServiceInterface extends CorekitBridgeUserServiceInterface<
  UserSchema,
  UserCredential
> {
  // You can add your own methods here

  /**
   * Get the user token
   *
   * This is a extends method from the corekit-bridge UserServiceInterface.
   */
  getToken(): string;
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
  verify(params: LoginParams): Promise<UserCredential>;

  /**
   * 主要用提交 OAuth 授权请求
   * @param payload
   */
  submitOAuthConsent(payload: OAuthConsentPayload): Promise<string>;

  sendOtp(phone: string): Promise<Otpre>;
  verifyOtp(phone: string, otp: string): Promise<PhoneLoginResponse>;
}
