import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import type { LocaleType } from '@config/i18n';
import {
  API_MAIL_PROVIDER_NOT_READY,
  API_MAIL_RECIPIENT_INVALID
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import type {
  FeMailLogAdminItemType,
  FeMailProviderSettingType,
  FeMailTemplateType
} from '@schemas/FeMailSchema';
import { feMailProviderSettingSchema } from '@schemas/FeMailSchema';
import { FeMailLogsRepository } from '@server/repositorys/FeMailLogsRepository';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import { renderTestMail } from './mailTemplates';
import { MemoryMailProvider } from './MemoryMailProvider';
import { ResendMailProvider } from './ResendMailProvider';
import type {
  MailAddressType,
  MailProviderInterface,
  MailSendResultType
} from './MailProviderInterface';
import type {
  MailSendParamsType,
  MailServiceInterface
} from './MailServiceInterface';
import type { LoggerInterface } from '@qlover/logger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SITE_NAME = 'Next OAuth';

type SenderConfigType = {
  readonly from: MailAddressType;
  readonly replyTo?: string;
};

/**
 * 事务邮件（独立于 Supabase Auth 邮件）。
 * 按 `mail.provider` 解析通道，发送后写入 `fe_mail_logs`。
 */
@injectable()
export class MailService implements MailServiceInterface {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService,
    @inject(FeMailLogsRepository)
    protected readonly logsRepository: FeMailLogsRepository,
    @inject(MemoryMailProvider)
    protected readonly memoryProvider: MemoryMailProvider,
    @inject(ResendMailProvider)
    protected readonly resendProvider: ResendMailProvider
  ) {}

  /**
   * @override
   */
  public async isEnabled(): Promise<boolean> {
    return (await this.resolveProviderSetting()) !== 'disabled';
  }

  /**
   * @override
   */
  public async getSiteName(): Promise<string> {
    const name = (
      await this.siteSettings.getString(FE_SITE_SETTING_KEYS.MAIL_FROM_NAME)
    ).trim();
    return name || DEFAULT_SITE_NAME;
  }

  /**
   * @override
   */
  public async send(params: MailSendParamsType): Promise<MailSendResultType> {
    const to = params.to.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(to)) {
      throw new ExecutorError(API_MAIL_RECIPIENT_INVALID);
    }

    const provider = await this.resolveProvider();
    const sender = await this.resolveSender();

    try {
      const result = await provider.send({
        from: sender.from,
        to,
        replyTo: sender.replyTo,
        subject: params.mail.subject,
        html: params.mail.html,
        text: params.mail.text
      });
      await this.writeLog(provider, params, to, {
        status: 'sent',
        providerMessageId: result.messageId
      });
      return result;
    } catch (error) {
      await this.writeLog(provider, params, to, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * @override
   */
  public async sendSafely(params: MailSendParamsType): Promise<boolean> {
    try {
      if (!(await this.isEnabled())) {
        return false;
      }
      await this.send(params);
      return true;
    } catch (error) {
      this.logger.warn('Mail send skipped/failed', {
        to: params.to,
        template: params.template,
        error
      });
      return false;
    }
  }

  /**
   * @override
   */
  public async sendTest(params: {
    to: string;
    locale: LocaleType;
    userId?: string | null;
    clientIp?: string | null;
  }): Promise<MailSendResultType> {
    const siteName = await this.getSiteName();
    return this.send({
      to: params.to,
      template: 'test',
      mail: renderTestMail({ locale: params.locale, siteName }),
      userId: params.userId,
      clientIp: params.clientIp
    });
  }

  /**
   * @override
   */
  public async listForAdmin(params: {
    limit?: number;
    email?: string;
    template?: FeMailTemplateType;
  }): Promise<FeMailLogAdminItemType[]> {
    return this.logsRepository.listRecent(params);
  }

  protected async resolveProviderSetting(): Promise<FeMailProviderSettingType> {
    const raw = (
      await this.siteSettings.getString(FE_SITE_SETTING_KEYS.MAIL_PROVIDER)
    )
      .trim()
      .toLowerCase();
    const parsed = feMailProviderSettingSchema.safeParse(raw);
    return parsed.success ? parsed.data : 'disabled';
  }

  protected async resolveProvider(): Promise<MailProviderInterface> {
    const setting = await this.resolveProviderSetting();
    if (setting === 'resend') {
      return this.resendProvider;
    }
    if (setting === 'memory') {
      return this.memoryProvider;
    }
    throw new ExecutorError(
      API_MAIL_PROVIDER_NOT_READY,
      'Mail provider is disabled (Admin site settings mail.provider)'
    );
  }

  protected async resolveSender(): Promise<SenderConfigType> {
    const [fromAddress, fromName, replyTo] = await Promise.all([
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.MAIL_FROM_ADDRESS),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.MAIL_FROM_NAME),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.MAIL_REPLY_TO)
    ]);

    const email = fromAddress.trim();
    if (!EMAIL_PATTERN.test(email)) {
      throw new ExecutorError(
        API_MAIL_PROVIDER_NOT_READY,
        'Sender address is missing (Admin site settings mail.from_address)'
      );
    }

    const reply = replyTo.trim();
    return {
      from: { email, name: fromName.trim() || DEFAULT_SITE_NAME },
      replyTo: EMAIL_PATTERN.test(reply) ? reply : undefined
    };
  }

  protected async writeLog(
    provider: MailProviderInterface,
    params: MailSendParamsType,
    to: string,
    outcome: {
      status: 'sent' | 'failed';
      providerMessageId?: string | null;
      error?: string | null;
    }
  ): Promise<void> {
    try {
      await this.logsRepository.insert({
        toEmail: to,
        subject: params.mail.subject,
        template: params.template,
        provider: provider.name,
        status: outcome.status,
        providerMessageId: outcome.providerMessageId ?? null,
        error: outcome.error ?? null,
        bodyText: provider.exposeContent() ? params.mail.text : null,
        userId: params.userId ?? null,
        createdIp: params.clientIp ?? null
      });
    } catch (error) {
      // 审计失败不应影响发送结果。
      this.logger.warn('Failed to write mail log', {
        to,
        template: params.template,
        error
      });
    }
  }
}
