import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { DeepPartial, ReleaseConfig, ReleaseContextOptions } from '../type';

export default class ReleaseContext extends FeScriptContext<ReleaseConfig> {
  protected readonly env: Env;
  protected config: ReleaseConfig;

  constructor(context: ReleaseContextOptions) {
    super(context);

    this.config = merge({}, this.feConfig.release, this.options);

    this.env = this.getInitEnv();
  }

  setConfig(config: DeepPartial<ReleaseConfig>): void {
    this.config = merge(this.config, config);
  }

  getConfig(key: string | string[], defaultValue?: unknown): unknown {
    return get(this.config, key, defaultValue);
  }

  getInitEnv(): Env {
    return Env.searchEnv({
      logger: this.logger,
      preloadList: this.feConfig.envOrder
    });
  }

  getEnv(): Env {
    return this.env;
  }

  getPkg(key: string): unknown {
    return this.getConfig('packageJson', key);
  }
}
