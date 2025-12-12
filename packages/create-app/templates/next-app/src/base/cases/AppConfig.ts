import { name, version } from '../../../package.json';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';
import type { StringValue } from 'ms';

export class AppConfig implements EnvConfigInterface {
  /**
   * Current environment mode for Vite
   * @description Represents the running environment (development, production, etc.)
   * Automatically set based on the current .env file being used
   */
  public readonly env: string = process.env.APP_ENV!;
  public readonly appName: string = name;
  public readonly appVersion: string = version;

  public readonly userTokenKey: string = '_user_token';

  public readonly testLoginEmail: string = process.env.NEXT_PUBLIC_LOGIN_USER!;
  public readonly testLoginPassword: string =
    process.env.NEXT_PUBLIC_LOGIN_PASSWORD!;

  public readonly supabaseUrl: string = process.env.SUPABASE_URL!;
  public readonly supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY!;

  public readonly stringEncryptorKey: string =
    process.env.NEXT_PUBLIC_STRING_ENCRYPT_KEY!;

  public readonly jwtSecret: string = process.env.JWT_SECRET!;
  /**
   * login user token expires in
   *
   * @example '30 days'
   * @example '1 year'
   */
  public readonly jwtExpiresIn: StringValue = '30 days';

  public readonly openaiBaseUrl: string = process.env.CEREBRAS_BASE_URL!;
  public readonly openaiApiKey: string = process.env.CEREBRAS_API_KEY!;
}
