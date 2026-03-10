import { name, version } from '../../package.json';
import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';

export class SeedConfig implements SeedConfigInterface {
  public readonly env: string = process.env.NODE_ENV;
  public readonly name: string = name;
  public readonly version: string = version;
  public readonly isProduction: boolean = process.env.NODE_ENV === 'production';
  public readonly authType: string = process.env.TARO_APP_AUTH_TYPE ?? 'Bearer';
}
