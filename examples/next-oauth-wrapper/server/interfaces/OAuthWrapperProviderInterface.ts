import type {
  OAuthServiceInterface,
  OAuthSessionPayload
} from '@shared/oauth-wrapper';
import type { UserSchema } from '@schemas/UserSchema';

export interface OAuthWrapperProviderInterface extends OAuthServiceInterface<OAuthSessionPayload> {
  /**
   * OAuthWrapper 用户信息交换
   *
   * 将 OAuthWrapper 包裹的登陆信息转换为 UserSchema 对象
   *
   * @param session
   */
  getUserSchema(session?: OAuthSessionPayload): Promise<UserSchema>;
}
