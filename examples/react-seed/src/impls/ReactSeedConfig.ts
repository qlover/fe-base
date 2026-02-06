import type { SeedConfigInterface } from '@/interfaces/SeedConfigInterface';

export class ReactSeedConfig implements SeedConfigInterface {
  /**
   * @override
   */
  public get env(): string {
    return import.meta.env.MODE;
  }
  public readonly name: string = import.meta.env.VITE_APP_NAME;
  public readonly version: string = import.meta.env.VITE_APP_VERSION;
  // public readonly isProduction: boolean = import.meta.env.PROD;
  public readonly isProduction: boolean = import.meta.env.MODE === 'production';
}
