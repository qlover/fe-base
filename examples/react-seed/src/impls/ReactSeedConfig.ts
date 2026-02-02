import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';

export class ReactSeedConfig implements ReactSeedConfigInterface {
  public readonly env: string = import.meta.env.MODE;
  public readonly name: string = import.meta.env.VITE_APP_NAME;
  public readonly version: string = import.meta.env.VITE_APP_VERSION;
  public readonly isProduction: boolean = import.meta.env.PROD;
}
