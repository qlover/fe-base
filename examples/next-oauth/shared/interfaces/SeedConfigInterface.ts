import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { StringValue } from 'ms';

export interface SharedConfigInterface extends SeedConfigInterface {
  // 需要扩展前后端通用配置
}

export interface SeedServerConfigInterface extends SharedConfigInterface {
  readonly siteUrl: string;
  readonly logPrefixTemplate: string;
  readonly userTokenKey: string;
  readonly jwtSecret: string;
  readonly appHost: string;
  readonly stringEncryptorKey: string;

  /**
   * login user token expires in
   *
   * @example '30 days'
   * @example '1 year'
   */
  readonly jwtExpiresIn: StringValue;

  readonly openaiBaseUrl: string;
  readonly openaiApiKey: string;

  /** HttpOnly OAuth session cookie signing secret. */
  readonly sessionSecret: string;
  /** AES-256-GCM key for encrypted provider tokens in DB. */
  readonly encryptionKey: string;

  /** Allowed CORS origins from `API_CORS_ALLOWED_ORIGINS`; empty disables CORS. */
  readonly apiCorsAllowedOrigins: readonly string[];

  /** Allowed CORS methods from `API_CORS_ALLOWED_METHODS`. */
  readonly apiCorsAllowedMethods: readonly string[];

  /** OAuth session key. */
  readonly oauthSessionKey: string;

  /** OAuth origin key. */
  readonly oauthOriginKey: string;
}
export interface SeedSrcConfigInterface extends SharedConfigInterface {
  readonly stringEncryptorKey: string;

  readonly testLoginEmail: string;
  readonly testLoginPassword: string;
}
