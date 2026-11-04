import type { UserSchema } from '@qlover/next-kit/common';

/**
 * 当前用户资料自助修改（展示名等）。
 */
export interface UserProfileServiceInterface {
  /**
   * 更新 `fe_users.display_name`，并同步会话 cookie 中的 `user.name`。
   *
   * @param userId - 当前登录用户 id
   * @param displayName - 已通过 DisplayNameSchema 校验的展示名
   * @returns 更新后的嵌入会话用户
   */
  updateDisplayName(
    userId: string,
    displayName: string
  ): Promise<UserSchema>;
}
