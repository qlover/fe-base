import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '../BootstrapExecutorPlugin';

export interface EnvConfigInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface InjectEnvConfig {
  prefix?: string;
  target?: EnvConfigInterface;
  source?: Record<string, unknown>;
  blackList?: string[];
}

export class InjectEnv implements BootstrapExecutorPlugin {
  public readonly pluginName = 'InjectEnv';

  constructor(
    /**
     * @since 2.0.0
     */
    protected options: InjectEnvConfig
  ) {}

  public static isJSONString(value: string): boolean {
    return (
      typeof value === 'string' &&
      value !== '' &&
      (value === 'true' ||
        value === 'false' ||
        value.startsWith('{') ||
        value.startsWith('['))
    );
  }

  public env<D>(key: string, defaultValue?: D): D {
    const { prefix = '', source = {} } = this.options;
    // transform key to env key
    const formattedKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    const envKey = `${prefix}${formattedKey}`;
    const value = source[envKey];
    // if it is a json string, parse it
    if (typeof value === 'string' && InjectEnv.isJSONString(value)) {
      return JSON.parse(value);
    }

    return (value ?? defaultValue) as D;
  }

  public inject(config: EnvConfigInterface): void {
    const { blackList = [] } = this.options;

    for (const key in config) {
      if (blackList.includes(key)) {
        continue;
      }

      const value = config[key as keyof typeof config];

      const envValue = this.env(key, value);

      if (!this.isEmpty(envValue) && envValue !== value) {
        config[key as keyof typeof config] = envValue;
      }
    }
  }

  public isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  public onBefore(): void {
    const { target } = this.options;

    if (!target) {
      throw new Error('target is required');
    }

    this.inject(target);

    // transform readonly to writable
    Object.freeze(target);
  }

  public onSuccess({ parameters: { logger } }: BootstrapContext): void {
    logger.debug('InjectEnv success!');
  }
}
