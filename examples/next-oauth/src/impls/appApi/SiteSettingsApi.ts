import { Base64Serializer } from '@qlover/fe-corekit/serializer';
import { StringEncryptor } from '@qlover/next-kit/common';
import { inject, injectable } from '@shared/container';
import { API_ADMIN_SITE_SETTINGS } from '@config/apiRoutes';
import type { FeCorsRule, FeSiteSettingKey } from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import type { FeAdminSiteSettingEntry } from '@schemas/FeSiteSettingsSchema';
import type { SeedSrcConfigInterface } from '@interfaces/SeedConfigInterface';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class SiteSettingsApi {
  protected readonly stringEncryptor: StringEncryptor;

  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester,
    @inject(I.AppConfig) appConfig: SeedSrcConfigInterface
  ) {
    this.stringEncryptor = new StringEncryptor(
      appConfig.stringEncryptorKey,
      new Base64Serializer()
    );
  }

  public async list(): Promise<FeAdminSiteSettingEntry[]> {
    const response = await this.appApiRequester.get(API_ADMIN_SITE_SETTINGS);
    const envelope = response.data as NextKitApiSuccess<
      FeAdminSiteSettingEntry[]
    >;
    return envelope.data ?? [];
  }

  /**
   * 保存设置；敏感项先用传输密钥加密，避免请求体出现明文。
   */
  public async patch(
    settings: Partial<
      Record<FeSiteSettingKey, string | boolean | string[] | FeCorsRule[]>
    >,
    sensitiveKeys?: ReadonlySet<FeSiteSettingKey>
  ): Promise<FeAdminSiteSettingEntry[]> {
    const response = await this.appApiRequester.patch(API_ADMIN_SITE_SETTINGS, {
      settings: this.encryptSensitiveValues(settings, sensitiveKeys)
    });
    const envelope = response.data as NextKitApiSuccess<
      FeAdminSiteSettingEntry[]
    >;
    return envelope.data ?? [];
  }

  protected encryptSensitiveValues(
    settings: Partial<
      Record<FeSiteSettingKey, string | boolean | string[] | FeCorsRule[]>
    >,
    sensitiveKeys?: ReadonlySet<FeSiteSettingKey>
  ): Partial<
    Record<FeSiteSettingKey, string | boolean | string[] | FeCorsRule[]>
  > {
    if (!sensitiveKeys || sensitiveKeys.size === 0) {
      return settings;
    }
    const next = { ...settings };
    for (const key of Object.keys(next) as FeSiteSettingKey[]) {
      const value = next[key];
      if (sensitiveKeys.has(key) && typeof value === 'string' && value) {
        next[key] = this.stringEncryptor.encrypt(value);
      }
    }
    return next;
  }
}
