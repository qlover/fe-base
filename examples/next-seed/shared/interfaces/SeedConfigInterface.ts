import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { StringValue } from 'ms';

export interface SeedServerConfigInterface extends SeedConfigInterface {
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
}
export interface SeedSrcConfigInterface extends SeedConfigInterface {
  readonly stringEncryptorKey: string;

  readonly testLoginEmail: string;
  readonly testLoginPassword: string;
}
