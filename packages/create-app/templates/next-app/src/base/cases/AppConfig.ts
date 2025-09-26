import { name, version } from '../../../package.json';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';
import type { StringValue } from 'ms';

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

  readonly testLoginEmail: string = process.env.NEXT_PUBLIC_LOGIN_USER!;
  readonly testLoginPassword: string = process.env.NEXT_PUBLIC_LOGIN_PASSWORD!;

  readonly supabaseUrl: string = process.env.SUPABASE_URL!;
  readonly supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY!;

  readonly stringEncryptorKey: string =
    process.env.NEXT_PUBLIC_STRING_ENCRYPT_KEY!;

  readonly jwtSecret: string = process.env.JWT_SECRET!;
  /**
   * login user token expires in
   *
   * @example '30 days'
   * @example '1 year'
   */
  readonly jwtExpiresIn: StringValue = '30 days';

  readonly openaiBaseUrl: string = process.env.ANTHROPIC_BASE_URL!;
  readonly openaiApiKey: string = process.env.ANTHROPIC_API_KEY!;
}
