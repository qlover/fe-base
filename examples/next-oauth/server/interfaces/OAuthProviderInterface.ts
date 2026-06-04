import type { UserSchema } from '@schemas/UserSchema';
import type { VerifyLoginParams } from '@server/services/OAuthService';
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
  | OAuthRedirect;

export interface OAuthProviderInterface {
  verifyLogin(params: VerifyLoginParams): Promise<UserSchema>;

  authorizePKCE(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<{ redirectAuthorizeUrl: string | URL }>;

  authorizePKCECallback(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<OAuthAuthorizationCallbackResult>;
}
