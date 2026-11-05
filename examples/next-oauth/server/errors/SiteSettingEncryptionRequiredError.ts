/**
 * 配置项要求 at-rest 加密，但服务端缺少 ENCRYPTION_KEY。
 */
export class SiteSettingEncryptionRequiredError extends Error {
  constructor(public readonly settingKey: string) {
    super(`ENCRYPTION_KEY required for site setting: ${settingKey}`);
    this.name = 'SiteSettingEncryptionRequiredError';
  }
}
