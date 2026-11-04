import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type {
  MailProviderInterface,
  MailSendInputType,
  MailSendResultType
} from './MailProviderInterface';
import type { LoggerInterface } from '@qlover/logger';

/**
 * 不真实投递：正文保存在 `fe_mail_logs`，
 * 运营可在 Admin「邮件日志」中直接查看（开发 / 联调用）。
 */
@injectable()
export class MemoryMailProvider implements MailProviderInterface {
  public readonly name = 'memory' as const;

  constructor(@inject(I.Logger) protected readonly logger: LoggerInterface) {}

  /**
   * @override
   */
  public async send(input: MailSendInputType): Promise<MailSendResultType> {
    this.logger.info('Memory mail captured', {
      to: input.to,
      subject: input.subject
    });
    return { messageId: null };
  }

  /**
   * @override
   */
  public exposeContent(): boolean {
    return true;
  }
}
