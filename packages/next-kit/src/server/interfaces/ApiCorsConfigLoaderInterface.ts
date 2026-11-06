import type { ApiCorsConfig } from '../utils/apiCors';

/**
 * CORS 配置加载器（通常由 SiteSettingsService 实现）。
 */
export interface ApiCorsConfigLoaderInterface {
  getCorsConfig(): Promise<ApiCorsConfig>;
}
