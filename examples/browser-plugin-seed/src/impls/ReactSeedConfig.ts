import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';
import pkg from '../../package.json';

export class ReactSeedConfig implements SeedConfigInterface {
  public readonly env: string = process.env.NODE_ENV;
  public readonly name: string = pkg.name;
  public readonly version: string = pkg.version;
  public readonly isProduction: boolean = process.env.NODE_ENV === 'production';
  public readonly authType: string =
    process.env.PLASMO_PUBLIC_AUTH_TYPE ?? 'Bearer';
}
