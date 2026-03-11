import type { SeedSrcConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import { name, version } from '../../package.json';

export class AppConfig implements SeedSrcConfigInterface {
  public readonly env: string = process.env.APP_ENV ?? 'development';
  public readonly name: string = name;
  public readonly version: string = version;
  public readonly isProduction: boolean = process.env.APP_ENV === 'production';
  public readonly logLevel: string =
    process.env.NEXT_PUBLIC_LOG_LEVEL ?? 'info';

  public readonly testLoginEmail: string =
    process.env.NEXT_PUBLIC_LOGIN_USER ?? '';
  public readonly testLoginPassword: string =
    process.env.NEXT_PUBLIC_LOGIN_PASSWORD ?? '';

  public readonly stringEncryptorKey: string =
    process.env.NEXT_PUBLIC_STRING_ENCRYPT_KEY ?? '';
}
