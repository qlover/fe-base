import type { LocaleType } from '@config/i18n';
import type {
  FeMailLogAdminItemType,
  FeMailTemplateType
} from '@schemas/FeMailSchema';
import type { MailSendResultType } from './MailProviderInterface';
import type { RenderedMailType } from './mailTemplates';

/** 一次发送请求。 */
export type MailSendParamsType = {
  readonly to: string;
  readonly template: FeMailTemplateType;
  readonly mail: RenderedMailType;
  readonly userId?: string | null;
  readonly clientIp?: string | null;
};

/**
 * 事务邮件门面：解析通道、发送并写 `fe_mail_logs` 审计。
 * 与 Supabase Auth 自带邮件相互独立。
 */
export interface MailServiceInterface {
  /** 邮件通道是否已启用（`mail.provider` 不是 `disabled`）。 */
  isEnabled(): Promise<boolean>;

  /** 模板中使用的站点名称（`mail.from_name`，缺省使用默认名）。 */
  getSiteName(): Promise<string>;

  /**
   * 发送并审计。
   *
   * @throws ExecutorError 收件人非法、通道未就绪或发送失败
   */
  send(params: MailSendParamsType): Promise<MailSendResultType>;

  /**
   * 尽力而为的通知：永不抛错。
   *
   * @returns 是否成功发出
   */
  sendSafely(params: MailSendParamsType): Promise<boolean>;

  /** 向指定邮箱发送测试邮件（Admin 联调）。 */
  sendTest(params: {
    to: string;
    locale: LocaleType;
    userId?: string | null;
    clientIp?: string | null;
  }): Promise<MailSendResultType>;

  /** Admin 邮件日志列表。 */
  listForAdmin(params: {
    limit?: number;
    email?: string;
    template?: FeMailTemplateType;
  }): Promise<FeMailLogAdminItemType[]>;
}
