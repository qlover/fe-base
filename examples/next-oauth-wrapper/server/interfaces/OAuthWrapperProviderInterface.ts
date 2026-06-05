import type { UserSchema } from '@schemas/UserSchema';
import type {
  OAuthProviderInterface,
  OAuthSessionPayload
} from '@qlover/oauth-wrapper';

export interface OAuthWrapperProviderInterface extends OAuthProviderInterface<OAuthSessionPayload> {
  /**
   * OAuthWrapper 用户信息交换
   *
   * OAuthWrapper 包裹的登陆信息转换为 UserSchema 对象
   *
   * @param session
   */
  getUserSchema(session?: OAuthSessionPayload): Promise<UserSchema | null>;

  /**
   * /oauth/authorize 页面是否需要登录
   *
   * - 如果是包装某个 旧登录接口一版需要返回 true
   * - 如果使用supabase这样有auth server则返回false
   */
  hasNeedLogged(): boolean;

  clearSession(): Promise<void>;
}
