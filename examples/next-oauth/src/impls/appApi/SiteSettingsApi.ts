import { inject, injectable } from '@shared/container';
import { API_ADMIN_SITE_SETTINGS } from '@config/apiRoutes';
import type { FeCorsRule, FeSiteSettingKey } from '@config/feSiteSettings';
import type { FeAdminSiteSettingEntry } from '@schemas/FeSiteSettingsSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class SiteSettingsApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async list(): Promise<FeAdminSiteSettingEntry[]> {
    const response = await this.appApiRequester.get(API_ADMIN_SITE_SETTINGS);
    const envelope = response.data as NextKitApiSuccess<
      FeAdminSiteSettingEntry[]
    >;
    return envelope.data ?? [];
  }

  public async patch(
    settings: Partial<
      Record<FeSiteSettingKey, string | boolean | string[] | FeCorsRule[]>
    >
  ): Promise<FeAdminSiteSettingEntry[]> {
    const response = await this.appApiRequester.patch(API_ADMIN_SITE_SETTINGS, {
      settings
    });
    const envelope = response.data as NextKitApiSuccess<
      FeAdminSiteSettingEntry[]
    >;
    return envelope.data ?? [];
  }
}
