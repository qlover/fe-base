import type { SeedConfigInterface } from './SeedConfigInterface';

export interface BootstrapInterface<Plugin> {
  startup(): void;
  startup(): Promise<unknown>;

  getPlugins(seedConfig: SeedConfigInterface): Plugin[];
}
