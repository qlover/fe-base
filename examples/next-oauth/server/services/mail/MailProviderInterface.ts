import type { FeMailProviderType } from '@schemas/FeMailSchema';

/** 邮件地址（可带显示名）。 */
export type MailAddressType = {
  readonly email: string;
  readonly name?: string;
};

/** 交给通道发送的一封邮件。 */
export type MailSendInputType = {
  readonly from: MailAddressType;
  readonly to: string;
  readonly replyTo?: string;
  readonly subject: string;
  readonly html: string;
  readonly text: string;
};

/** 通道发送结果。 */
export type MailSendResultType = {
  /** 通道侧消息 id（如 Resend 的 `id`），没有则为 null。 */
  readonly messageId: string | null;
};

/**
 * 事务邮件通道。与 Supabase Auth 自带邮件相互独立；
 * 每次发送都由 {@link MailService} 写入 `fe_mail_logs` 审计。
 */
export interface MailProviderInterface {
  /** 通道标识，同时写入日志的 `provider` 列。 */
  readonly name: FeMailProviderType;

  /**
   * 发送一封邮件。
   *
   * @param input - 邮件内容
   * @returns 发送结果
   * @throws ExecutorError 通道未配置或被上游拒绝时抛出
   */
  send(input: MailSendInputType): Promise<MailSendResultType>;

  /** Admin 是否可以在邮件日志中查看正文（含链接）；仅开发用 memory 通道为 true。 */
  exposeContent(): boolean;
}
