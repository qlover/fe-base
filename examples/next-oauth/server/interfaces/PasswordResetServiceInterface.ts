import type { LocaleType } from '@config/i18n';

/** 触发请求的上下文（用于邮件语言与审计）。 */
export type PasswordResetRequestMetaType = {
  readonly locale: LocaleType;
  readonly clientIp?: string | null;
  readonly userAgent?: string | null;
};

/**
 * 邮件找回 / 重置密码（独立于 Supabase Recovery 邮件，仅 Supabase upstream 可用）。
 * 重置成功后会撤销该用户的全部会话。
 */
export interface PasswordResetServiceInterface {
  /**
   * 是否可用：`mail.password_reset_enabled` 开启、邮件通道非 `disabled`，
   * 且当前 upstream 为 Supabase。
   */
  isEnabled(): Promise<boolean>;

  /**
   * 申请重置链接。无论邮箱是否存在都以同样方式返回，避免被探测账号。
   *
   * @throws ExecutorError 功能未开启或 IP 冷却中
   */
  requestReset(
    params: { readonly email: string } & PasswordResetRequestMetaType
  ): Promise<void>;

  /**
   * 校验令牌是否可用（未使用、未过期、功能开启）。
   */
  verifyToken(token: string): Promise<{ readonly valid: boolean }>;

  /**
   * 凭令牌设置新密码，并撤销该用户全部会话。
   *
   * @param params.newPassword - 已解密的明文新密码（6–50 位、无空白）
   * @throws ExecutorError 密码不合规、令牌无效或功能未开启
   */
  resetPassword(
    params: {
      readonly token: string;
      readonly newPassword: string;
    } & PasswordResetRequestMetaType
  ): Promise<void>;
}
