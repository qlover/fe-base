import type { BootstrapExecutorPlugin } from '../BootstrapExecutorPlugin';

export interface EnvConfigInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class InjectEnv implements BootstrapExecutorPlugin {
  readonly pluginName = 'InjectEnv';

  constructor(
    private target: EnvConfigInterface,
    private source: Record<string, unknown>,
    private envPrefix: string = '',
    private envWhiteList: string[] = ['env', 'userNodeEnv']
  ) {}

  static isJSONString(value: string): boolean {
    return (
      typeof value === 'string' &&
      value !== '' &&
      (value === 'true' ||
        value === 'false' ||
        value.startsWith('{') ||
        value.startsWith('['))
    );
  }

  env<D>(key: string, defaultValue?: D): D {
    // transform key to env key
    const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    const envKey = `${this.envPrefix}${formattedKey}`;
    const value = this.source[envKey];
    // if it is a json string, parse it
    if (typeof value === 'string' && InjectEnv.isJSONString(value)) {
      return JSON.parse(value);
    }

    return (value ?? defaultValue) as D;
  }

  inject(config: EnvConfigInterface): void {
    for (const key in config) {
      if (this.envWhiteList.includes(key)) {
        continue;
      }

      const value = config[key as keyof typeof config];

      config[key as keyof typeof config] = this.env(key, value);
    }
  }

  onBefore(): void {
    this.inject(this.target);

    // transform readonly to writable
    Object.freeze(this.target);
  }
}
