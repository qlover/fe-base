import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { DeepPartial, ReleaseConfig, ReleaseContextOptions } from '../type';

/**
 * Release context
 *
 * 1. config runtimes
 * 2. config default
 */
export default class ReleaseContext extends FeScriptContext<ReleaseConfig> {
  protected readonly env: Env;
  protected config: ReleaseConfig;
  protected readonly defaultConfig: ReleaseConfig;

  constructor(context: ReleaseContextOptions) {
    super(context);

    this.config = merge({}, this.feConfig.release, this.options);
    this.defaultConfig = Object.freeze(merge({}, this.config));

    this.env = Env.searchEnv({
      logger: this.logger,
      preloadList: this.feConfig.envOrder
    });
  }

  /**
   * get default config
   *
   * Original configuration that has not been modified.
   *
   * @param key
   * @param defaultValue
   * @returns
   */
  getDefaultConfig<T = unknown>(key: string | string[], defaultValue?: T): T {
    return get(this.config, key, defaultValue);
  }

  /**
   * set config
   *
   * Can be set differently at runtime, including default configuration.
   *
   * @param config
   */
  setConfig(config: DeepPartial<ReleaseConfig>): void {
    this.config = merge(this.config, config);
  }

  /**
   * Get the runtime configuration.
   *
   * @example
   *
   * ```ts
   * defaultConfig : {
   *   name: 'name-${version}'
   * }
   *
   * setConfig({name: 'name-1.2.0'})
   *
   * const name = this.getConfig('name'); // name-1.2.0
   * const defaultName = this.getDefaultConfig('name'); // name-${version}
   * ```
   *
   * @param key
   * @param defaultValue
   * @returns
   */
  getConfig<T = unknown>(key: string | string[], defaultValue?: T): T {
    return get(this.config, key, defaultValue);
  }

  /**
   * Get the environment variable.
   *
   * @returns
   */
  getEnv(): Env {
    return this.env;
  }

  /**
   * Get the package.json configuration.
   *
   * Get the runtime configuration of package.json.
   *
   * @param key
   * @returns
   */
  getPkg(key: string): unknown {
    return this.getConfig(['packageJson', key]);
  }
}
