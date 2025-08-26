import { name, version } from '../../../package.json';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';

export class AppConfig implements EnvConfigInterface {
  /**
   * Current environment mode for Vite
   * @description Represents the running environment (development, production, etc.)
   * Automatically set based on the current .env file being used
   */
  readonly env: string = process.env.APP_ENV!;
  readonly appName: string = name;
  readonly appVersion: string = version;

  readonly userTokenKey: string = '_user_token';
}
