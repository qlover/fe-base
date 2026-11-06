import type { LocaleType } from '@config/i18n';

/** 触发密码变更的请求上下文。 */
export type PasswordChangedNotifyParamsType = {
  readonly userId: string;
  readonly email: string;
  readonly locale: LocaleType;
  readonly clientIp?: string | null;
  readonly userAgent?: string | null;
};

/**
 * 密码被修改后的安全通知邮件（站点设置 `mail.password_changed_notify_enabled`）。
 */
export interface PasswordChangedNotifyServiceInterface {
  /**
   * 尽力而为：开关关闭、通道未启用或发送失败都不抛错。
   *
   * @param params - 用户、收件邮箱与请求来源
   */
  notify(params: PasswordChangedNotifyParamsType): Promise<void>;
}
