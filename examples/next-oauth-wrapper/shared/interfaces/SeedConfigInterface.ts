import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { StringValue } from 'ms';

export interface SeedServerConfigInterface extends SeedConfigInterface {
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
  readonly adminUserIds: number[];
}
export interface SeedSrcConfigInterface extends SeedConfigInterface {
  readonly stringEncryptorKey: string;

  readonly testLoginEmail: string;
  readonly testLoginPassword: string;
}
