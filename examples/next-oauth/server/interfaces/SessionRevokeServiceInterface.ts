/**
 * 「退出所有设备」：让某用户此前签发的全部会话与令牌失效。
 */
export interface SessionRevokeServiceInterface {
  /**
   * 撤销用户的全部会话：
   * - 写 `fe_users.sessions_revoked_at` 并刷新进程缓存（浏览器会话 JWT 失效）；
   * - 作废第三方 OAuth refresh token 与已存的上游凭证；
   * - 尽力对 Supabase 做 global sign-out。
   *
   * @param params - userId 目标用户；email 用于铸造临时 Supabase 会话做 global 登出（可选）
   */
  revokeAll(params: {
    readonly userId: string;
    readonly email?: string | null;
  }): Promise<void>;
}
