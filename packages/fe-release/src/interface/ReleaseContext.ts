import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { DeepPartial, ReleaseConfig, ReleaseContextOptions } from '../type';

export default class ReleaseContext extends FeScriptContext<ReleaseConfig> {
  protected readonly env: Env;

  constructor(context: ReleaseContextOptions) {
    super(context);

    this.env = this.getInitEnv();
  }

  setConfig(config: DeepPartial<ReleaseConfig>): void {
    this.options = merge(this.options, config);
  }

  getConfig<T = unknown>(key: string | string[], defaultValue?: T): T {
    return get(this.options, key, defaultValue);
  }

  getInitEnv(): Env {
    try {
      const preloadList = this.feConfig?.envOrder || ['.env.local', '.env'];
      return Env.searchEnv({
        logger: this.logger,
        preloadList
      });
    } catch (error) {
      this.logger.error('Failed to initialize environment:', error);
      // Return a default Env instance to avoid returning undefined
      return new Env({ rootPath: process.cwd(), logger: this.logger });
    }
  }

  getEnv(): Env {
    return this.env;
  }

  getPkg(key: string): unknown {
    return this.getConfig(['environment', 'packageJson', key]);
  }
}
