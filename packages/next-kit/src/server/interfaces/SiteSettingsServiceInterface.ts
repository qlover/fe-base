import type { ApiCorsConfig } from '../utils/apiCors';

/**
 * 站点设置原始值（非敏感明文或非敏感结构化值）。
 */
export type SiteSettingPrimitiveType =
  | string
  | boolean
  | ReadonlyArray<string>
  | ReadonlyArray<Record<string, unknown>>;

/**
 * 站点设置读取契约（CORS / 开关 / 密钥等）。
 */
export interface SiteSettingsServiceInterface {
  invalidateCache(): Promise<void>;
  getBoolean(key: string): Promise<boolean>;
  getString(key: string): Promise<string>;
  getStringArray(key: string): Promise<string[]>;
  getSecretString(key: string): Promise<string>;
  getValue(key: string): Promise<SiteSettingPrimitiveType>;
  getCorsConfig(): Promise<ApiCorsConfig>;
}
