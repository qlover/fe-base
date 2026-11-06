import type { LinkedLoginType } from '@schemas/LinkedLoginSchema';

/**
 * 当前用户已关联的第三方登录列表（只读）。
 */
export interface LinkedLoginServiceInterface {
  /**
   * 合并 Supabase Auth identities 与 `fe_oauth_user_links`。
   *
   * @param userId - 当前登录用户 id
   */
  listForUser(userId: string): Promise<LinkedLoginType[]>;
}
