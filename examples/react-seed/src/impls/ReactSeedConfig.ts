import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';

export class ReactSeedConfig implements SeedConfigInterface {
  /**
   * @override
   */
  public readonly env: string = import.meta.env.MODE ?? 'development';
  public readonly name: string = import.meta.env.VITE_APP_NAME;
  public readonly version: string = import.meta.env.VITE_APP_VERSION;
  // public readonly isProduction: boolean = import.meta.env.PROD;
  public readonly isProduction: boolean = import.meta.env.MODE === 'production';
  public readonly logLevel: string = 'debug';
  public readonly userCredentialKey: string = 'koieluf341bj';
}
