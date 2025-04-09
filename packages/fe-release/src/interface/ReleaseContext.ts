import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import type {
  DeepPartial,
  ReleaseConfig,
  ReleaseContextOptions
} from '../type';
import type ReleaseItInstanceType from 'release-it';
import {
  ReleaseItInstanceOptions,
  ReleaseItInstanceResult
} from '../plugins/release-it/ReleaseIt';

const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

export default class ReleaseContext<
  T extends ReleaseConfig = ReleaseConfig
> extends FeScriptContext<T> {
  protected readonly _env: Env;
  protected readonly releaseIt: ReleaseItInstanceType;

  constructor(context: ReleaseContextOptions<T>) {
    super(context);

    this._env = Env.searchEnv({
      logger: this.logger,
      preloadList: this.feConfig?.envOrder || DEFAULT_ENV_ORDER
    });

    if (!context.options?.releaseIt?.releaseIt) {
      throw new Error('releaseIt is not set');
    }

    this.releaseIt = context.options.releaseIt.releaseIt;
  }

  get releasePR(): boolean {
    return !!this.options.environment?.releasePR;
  }

  get releasePackageName(): string | undefined {
    return this.getPkg('name');
  }

  get releasePublishPath(): string | undefined {
    return this.getConfig('environment.publishPath');
  }

  get rootPath(): string {
    return this.getConfig('environment.rootPath', './');
  }

  get env(): Env {
    return this._env;
  }

  setConfig(config: DeepPartial<ReleaseConfig>): void {
    this.options = merge(this.options, config);
  }

  getConfig<T = unknown>(key: string | string[], defaultValue?: T): T {
    return get(this.options, key, defaultValue);
  }

  getPkg<T>(key?: string, defaultValue?: T): T {
    if (!key) {
      return this.getConfig<T>('environment.packageJson', defaultValue);
    }

    return this.getConfig<T>(['environment', 'packageJson', key], defaultValue);
  }

  /**
   * Run release-it in the publish path
   *
   * Because `release-it` only support signle publish path,
   * so we need to change the current working directory to the publish path.
   *
   * @note This method will change the current working directory to the publish path.
   * @param options - The options for the release-it process.
   * @returns The output from the release-it process.
   */
  async runReleaseIt(
    options: ReleaseItInstanceOptions
  ): Promise<ReleaseItInstanceResult> {
    if (!this.releasePublishPath) {
      throw new Error('publishPath is not set');
    }

    const lastDir = process.cwd();

    try {
      this.logger.debug('Switch to publish path to:', this.releasePublishPath);
      process.chdir(this.releasePublishPath);
      return await this.releaseIt(options);
    } finally {
      this.logger.debug('Switch back to:', lastDir);
      process.chdir(lastDir);
    }
  }
}
