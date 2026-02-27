import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { name, version } from '../package.json';
import type { StringValue } from 'ms';

export class ServerConfig implements SeedServerConfigInterface {
  public readonly env: string = process.env.APP_ENV!;
  public readonly name: string = name;
  public readonly version: string = version;
  public readonly isProduction: boolean = process.env.APP_ENV === 'production';

  public readonly userTokenKey: string = '_user_token';

  public readonly jwtSecret: string = process.env.JWT_SECRET!;
  public readonly appHost: string = process.env.APP_HOST!;
  /**
   * login user token expires in
   *
   * @example '30 days'
   * @example '1 year'
   */
  public readonly jwtExpiresIn: StringValue = '30 days';

  public readonly openaiBaseUrl: string = process.env.CEREBRAS_BASE_URL!;
  public readonly openaiApiKey: string = process.env.CEREBRAS_API_KEY!;
  public readonly stringEncryptorKey: string =
    process.env.NEXT_PUBLIC_STRING_ENCRYPT_KEY!;
}
