import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import {
  AdminOverviewCheckKey,
  AdminOverviewCheckState,
  type AdminOverviewCheckType
} from '@schemas/AdminOverviewSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { SiteSettingsService } from '@server/services/SiteSettingsService';

/**
 * 站点关键配置体检：只报告状态，不返回任何配置值。
 */
@injectable()
export class AdminOverviewConfigCheckService {
  constructor(
    @inject(I.AppConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  /**
   * @returns 各检查项状态（ok 正常 / warn 需处理 / off 未启用）
   */
  public async check(): Promise<AdminOverviewCheckType[]> {
    const [openaiKey, mailProvider, resendKey] = await Promise.all([
      this.siteSettings
        .getSecretString(FE_SITE_SETTING_KEYS.OPENAI_API_KEY)
        .catch(() => ''),
      this.siteSettings
        .getString(FE_SITE_SETTING_KEYS.MAIL_PROVIDER)
        .catch(() => 'disabled'),
      this.siteSettings
        .getSecretString(FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY)
        .catch(() => '')
    ]);

    const openaiConfigured =
      openaiKey.trim().length > 0 ||
      this.serverConfig.openaiApiKey.trim().length > 0;
    const provider = mailProvider.trim() || 'disabled';
    const isResend = provider === 'resend';

    return [
      {
        key: AdminOverviewCheckKey.encryptionKey,
        state: this.serverConfig.encryptionKey?.trim()
          ? AdminOverviewCheckState.ok
          : AdminOverviewCheckState.warn
      },
      {
        key: AdminOverviewCheckKey.serviceRoleKey,
        state: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? AdminOverviewCheckState.ok
          : AdminOverviewCheckState.warn
      },
      {
        key: AdminOverviewCheckKey.openai,
        state: openaiConfigured
          ? AdminOverviewCheckState.ok
          : AdminOverviewCheckState.off
      },
      {
        key: AdminOverviewCheckKey.mailProvider,
        state:
          provider === 'disabled'
            ? AdminOverviewCheckState.off
            : AdminOverviewCheckState.ok
      },
      {
        key: AdminOverviewCheckKey.mailResendApiKey,
        state: isResend
          ? resendKey.trim()
            ? AdminOverviewCheckState.ok
            : AdminOverviewCheckState.warn
          : AdminOverviewCheckState.off
      }
    ];
  }
}
