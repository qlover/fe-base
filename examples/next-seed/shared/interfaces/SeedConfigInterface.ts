import type { StringValue } from 'ms';

/**
 * 基础配置接口
 *
 * 主要用于初始化项目配置、环境等
 */
export interface SeedConfigInterface {
  readonly env: string;
  readonly name: string;
  readonly version: string;
  readonly isProduction: boolean;
  readonly stringEncryptorKey: string;
}

export interface SeedServerConfigInterface extends SeedConfigInterface {
  readonly userTokenKey: string;
  readonly jwtSecret: string;
  readonly appHost: string;

  /**
   * login user token expires in
   *
   * @example '30 days'
   * @example '1 year'
   */
  readonly jwtExpiresIn: StringValue;

  readonly openaiBaseUrl: string;
  readonly openaiApiKey: string;
}
export interface SeedSrcConfigInterface extends SeedConfigInterface {
  readonly testLoginEmail: string;
  readonly testLoginPassword: string;
}
