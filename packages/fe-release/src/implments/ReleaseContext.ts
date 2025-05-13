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
import { WorkspaceValue } from '../plugins/workspaces/Workspaces';

const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

export default class ReleaseContext<
  T extends ReleaseConfig = ReleaseConfig
> extends FeScriptContext<T> {
  protected readonly _env: Env;

  /**
   * Shared Config
   */
  public shared: SharedReleaseOptions;

  constructor(context: ReleaseContextOptions<T>) {
    super(context);

    this._env = Env.searchEnv({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      logger: this.logger as any,
      preloadList: this.feConfig.envOrder || DEFAULT_ENV_ORDER
    });

    // don't use deep merge, because the shared options will be overwritten by the default options
    this.shared = Object.assign(
      {},
      this.feConfig.release,
      this.getDefaultShreadOptions(context.shared)
    );
  }

  private getDefaultShreadOptions(
    props?: SharedReleaseOptions
  ): SharedReleaseOptions {
    return {
      rootPath: process.cwd(),
      // use currentBranch by default
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

  get workspaces(): WorkspaceValue[] | undefined {
    return this.getConfig('workspaces.workspaces');
  }

  get workspace(): WorkspaceValue | undefined {
    return this.getConfig('workspaces.workspace');
  }

  setWorkspaces(workspaces: WorkspaceValue[]): void {
    this.options.workspaces = {
      ...this.options.workspaces,
      workspaces
    };
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
    const packageJson = this.workspace?.packageJson;

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
      ...this.workspace!,
      publishPath: this.workspace?.path || '',
      // deprecated
      env: this.releaseEnv,
      branch: this.sourceBranch
    };
  }

  async runChangesetsCli(name: string, args?: string[]): Promise<string> {
    // is pnpm?
    let packageManager = 'pnpm';
    try {
      await this.shell.exec('pnpm -v', { dryRun: false });
    } catch {
      packageManager = 'npx';
    }

    return await this.shell.exec([
      packageManager,
      'changeset',
      name,
      ...(args ?? [])
    ]);
  }
}
