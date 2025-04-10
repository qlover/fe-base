import type ReleaseItInstanceType from 'release-it';
import type { SharedReleaseOptions } from './ShreadReleaseOptions';
import type {
  DeepPartial,
  ReleaseConfig,
  ReleaseContextOptions
} from '../type';
import type {
  ReleaseItInstanceOptions,
  ReleaseItInstanceResult
} from '../plugins/release-it/ReleaseIt';
import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { DEFAULT_SOURCE_BRANCH } from '../defaults';

const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

export default class ReleaseContext<
  T extends ReleaseConfig = ReleaseConfig
> extends FeScriptContext<T> {
  protected readonly _env: Env;
  protected readonly releaseIt: ReleaseItInstanceType;

  /**
   * Shared Config
   */
  shared: SharedReleaseOptions;

  constructor(context: ReleaseContextOptions<T>) {
    super(context);

    if (!context.options?.releaseIt?.releaseIt) {
      throw new Error('releaseIt is not set');
    }

    this._env = Env.searchEnv({
      logger: this.logger,
      preloadList: this.feConfig.envOrder || DEFAULT_ENV_ORDER
    });

    // use ReleaseIt to relese github/git and npm publish
    // FIXME: replace `release-it`
    this.releaseIt = context.options.releaseIt.releaseIt;

    this.shared = merge(
      this.getDefaultShreadOptions(context.shared),
      this.feConfig.release
    );
  }

  private getDefaultShreadOptions(
    props?: SharedReleaseOptions
  ): SharedReleaseOptions {
    return {
      rootPath: process.cwd(),
      // FIXME: use current git branch by default
      sourceBranch:
        this._env.get('FE_RELEASE_BRANCH') ||
        this._env.get('FE_RELEASE_SOURCE_BRANCH') ||
        DEFAULT_SOURCE_BRANCH,
      releaseEnv:
        this._env.get('FE_RELEASE_ENV') ||
        this._env.get('NODE_ENV') ||
        'development',
      ...props
    };
  }

  get releasePR(): boolean {
    return !!this.shared.releasePR;
  }

  get releasePackageName(): string {
    return this.getPkg('name');
  }

  get releasePublishPath(): string | undefined {
    return this.shared.publishPath;
  }

  get rootPath(): string {
    return this.shared.rootPath!;
  }

  get sourceBranch(): string {
    return this.shared.sourceBranch!;
  }

  get releaseEnv(): string {
    return this.shared.releaseEnv!;
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

  setShared(shared: Partial<SharedReleaseOptions>): void {
    this.shared = merge(this.shared, shared);
  }

  getPkg<T>(key?: string, defaultValue?: T): T {
    const packageJson = this.shared.packageJson;

    if (!packageJson) {
      throw new Error('package.json is not found');
    }

    if (!key) {
      return packageJson as T;
    }

    return get(packageJson, key, defaultValue) as T;
  }

  /**
   * Run release-it in the publish path
   *
   * Because `release-it` only support signle publish path,
   * so we need to change the current working directory to the publish path.
   *
   * FIXME: replace `process.chdir`
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
