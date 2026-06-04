import type { UserSchema } from '@schemas/UserSchema';
import type { VerifyLoginParams } from '@server/services/OAuthService';
import type { OAuthGatewayCallbackParams } from '@qlover/oauth-wrapper/client';
import type {
  OAuthAuthorizationDetails,
  OAuthRedirect
} from '@supabase/supabase-js';

/**
 * FIXME: 可以通用返回类型, 不仅仅是supabase
 *
 * @see https://supabase.com/docs/guides/auth/oauth-server/getting-started#example-authorization-ui
 *
 * 当返回的值只有redirect_url时, 则需要跳转说明用户已经同意过了
 */
export type OAuthAuthorizationCallbackResult =
  | OAuthAuthorizationDetails
  /**
   * 其中 OAuthGatewayCallbackParams.code是next-oauth生成，用于给源地址访问 /oauth/token 交互
   */
  | (OAuthRedirect & OAuthGatewayCallbackParams);

export interface OAuthProviderInterface {
  getUser(): Promise<UserSchema | null>;

  clearSession(): Promise<void>;

  verifyLogin(params: VerifyLoginParams): Promise<UserSchema>;

  authorizePKCE(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<{ redirectAuthorizeUrl: string | URL }>;

  authorizePKCECallback(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<OAuthAuthorizationCallbackResult>;
}
