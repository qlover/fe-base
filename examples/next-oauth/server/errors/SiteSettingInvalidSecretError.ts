/**
 * 管理端提交的敏感值无法解密或含非法控制字符。
 */
export class SiteSettingInvalidSecretError extends Error {
  constructor(public readonly settingKey: string) {
    super(`Invalid secret for site setting: ${settingKey}`);
    this.name = 'SiteSettingInvalidSecretError';
  }
}
