import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import type { GithubFeedbackConfigType } from '@server/interfaces/GithubIssueGatewayInterface';
import { SiteSettingsService } from '@server/services/SiteSettingsService';

const REPO_PATTERN = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/;
const NUMERIC_ID_PATTERN = /^\d+$/;

type GithubFeedbackRawConfigType = {
  readonly appId: string;
  readonly installationId: string;
  readonly privateKey: string;
  readonly repo: string;
};

/**
 * 从站点设置解析 GitHub 反馈同步配置；未开启或任一项不合法时返回 null。
 */
@injectable()
export class GithubFeedbackConfigResolver {
  constructor(
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  /**
   * @param options.ignoreEnabled - 管理员手动创建时忽略「自动同步」开关
   */
  public async resolve(
    options: { readonly ignoreEnabled?: boolean } = {}
  ): Promise<GithubFeedbackConfigType | null> {
    if (!options.ignoreEnabled) {
      const enabled = await this.siteSettings.getBoolean(
        FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED
      );
      if (!enabled) {
        return null;
      }
    }

    const raw = await this.readRaw();
    const repoMatch = REPO_PATTERN.exec(raw.repo);
    if (!this.isValid(raw) || !repoMatch) {
      return null;
    }

    return {
      appId: raw.appId,
      installationId: raw.installationId,
      privateKey: raw.privateKey,
      owner: repoMatch[1] ?? '',
      repo: repoMatch[2] ?? ''
    };
  }

  protected async readRaw(): Promise<GithubFeedbackRawConfigType> {
    const [appId, installationId, privateKey, repo] = await Promise.all([
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.GITHUB_APP_ID),
      this.siteSettings.getString(
        FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID
      ),
      this.siteSettings.getSecretString(
        FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY
      ),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO)
    ]);
    return {
      appId: appId.trim(),
      installationId: installationId.trim(),
      privateKey,
      repo: repo.trim()
    };
  }

  protected isValid(raw: GithubFeedbackRawConfigType): boolean {
    return (
      NUMERIC_ID_PATTERN.test(raw.appId) &&
      NUMERIC_ID_PATTERN.test(raw.installationId) &&
      raw.privateKey.includes('PRIVATE KEY') &&
      REPO_PATTERN.test(raw.repo)
    );
  }
}
