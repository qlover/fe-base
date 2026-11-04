import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import { localePage, ROUTE_AUTH_FORGOT_PASSWORD } from '@config/route';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  PasswordChangedNotifyParamsType,
  PasswordChangedNotifyServiceInterface
} from '@server/interfaces/PasswordChangedNotifyServiceInterface';
import { MailService } from '@server/services/mail/MailService';
import type { MailServiceInterface } from '@server/services/mail/MailServiceInterface';
import { renderPasswordChangedMail } from '@server/services/mail/mailTemplates';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import type { LoggerInterface } from '@qlover/logger';

/**
 * 密码变更安全通知：由「登录态修改密码」与「邮件重置密码」两条链路共用。
 */
@injectable()
export class PasswordChangedNotifyService implements PasswordChangedNotifyServiceInterface {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(I.AppConfig) protected readonly config: SeedServerConfigInterface,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService,
    @inject(MailService) protected readonly mailService: MailServiceInterface
  ) {}

  /**
   * @override
   */
  public async notify(params: PasswordChangedNotifyParamsType): Promise<void> {
    try {
      const enabled = await this.siteSettings.getBoolean(
        FE_SITE_SETTING_KEYS.MAIL_PASSWORD_CHANGED_NOTIFY_ENABLED
      );
      if (!enabled) {
        return;
      }

      // 「找回密码」可用时，邮件里附上重置入口，方便非本人操作时自救。
      const publicConfig = await this.siteSettings.getPublicConfig();
      const forgotPasswordUrl = publicConfig.auth.passwordResetEnabled
        ? new URL(
            `/${localePage(ROUTE_AUTH_FORGOT_PASSWORD, params.locale)}`,
            this.config.siteUrl
          ).toString()
        : null;

      await this.mailService.sendSafely({
        to: params.email,
        template: 'password_changed',
        mail: renderPasswordChangedMail({
          locale: params.locale,
          siteName: await this.mailService.getSiteName(),
          changedAt: new Date(),
          ip: params.clientIp,
          userAgent: params.userAgent,
          forgotPasswordUrl
        }),
        userId: params.userId,
        clientIp: params.clientIp
      });
    } catch (error) {
      this.logger.warn('Password changed notification failed', {
        userId: params.userId,
        error
      });
    }
  }
}
