import { inject, injectable } from '@shared/container';
import type {
  FeAdminSiteSettingEntry,
  FePublicConfig
} from '@schemas/FeSiteSettingsSchema';
import { feAdminSiteSettingsPatchSchema } from '@schemas/FeSiteSettingsSchema';
import { SiteSettingsService } from '@server/services/SiteSettingsService';

@injectable()
export class SiteSettingsController {
  constructor(
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  public async getAdminSettings(): Promise<FeAdminSiteSettingEntry[]> {
    return this.siteSettings.getAdminSettings();
  }

  public async patchAdminSettings(
    body: unknown
  ): Promise<FeAdminSiteSettingEntry[]> {
    const parsed = feAdminSiteSettingsPatchSchema.parse(body);
    return this.siteSettings.updateAdminSettings(parsed);
  }

  public async getPublicConfig(): Promise<FePublicConfig> {
    return this.siteSettings.getPublicConfig();
  }
}
