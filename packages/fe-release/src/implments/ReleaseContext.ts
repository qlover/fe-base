import type { SharedReleaseOptions } from '../interface/ShreadReleaseOptions';
import type {
  DeepPartial,
  ReleaseConfig,
  ReleaseContextOptions,
  TemplateContext
} from '../type';
import { FeScriptContext } from '@qlover/scripts-context';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { DEFAULT_SOURCE_BRANCH } from '../defaults';
import ReleaseIt from './release-it/ReleaseIt';

const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

export default class ReleaseContext<
  T extends ReleaseConfig = ReleaseConfig
> extends FeScriptContext<T> {
  protected readonly _env: Env;
  public readonly releaseIt: ReleaseIt;

  /**
   * Shared Config
   */
  public shared: SharedReleaseOptions;

  constructor(context: ReleaseContextOptions<T>) {
    super(context);

    this.releaseIt = new ReleaseIt(this, context.options!.releaseIt);

    this._env = Env.searchEnv({
      logger: this.logger,
      preloadList: this.feConfig.envOrder || DEFAULT_ENV_ORDER
    });

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

  getTemplateContext(): TemplateContext {
    return {
      ...this.shared,
      publishPath: this.releasePublishPath!
    };
  }
}
