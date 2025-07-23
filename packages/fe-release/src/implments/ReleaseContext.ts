import type { TemplateContext } from '../type';
import get from 'lodash/get';
import { DEFAULT_SOURCE_BRANCH } from '../defaults';
import {
  WorkspacesProps,
  WorkspaceValue
} from '../plugins/workspaces/Workspaces';
import {
  FeReleaseConfig,
  ScriptContext,
  ScriptContextInterface,
  ScriptSharedInterface
} from '@qlover/scripts-context';
import { GithubPRProps } from '../plugins/githubPR/GithubPR';
import { PluginClass, PluginTuple } from '../utils/tuple';

export interface ReleaseContextOptions
  extends ScriptContextInterface<ReleaseContextConfig> {}

export interface ReleaseContextConfig
  extends FeReleaseConfig,
    ScriptSharedInterface {
  /**
   * The github PR of the project
   * @private
   */
  githubPR?: GithubPRProps;

  /**
   * The workspaces of the project
   * @private
   */
  workspaces?: WorkspacesProps;

  /**
   * The environment of the project
   *
   * default:
   * - first, get from `FE_RELEASE_ENV`
   * - second, get from `NODE_ENV`
   * - `development`
   */
  releaseEnv?: string;

  /**
   * Plugins
   */
  plugins?: PluginTuple<PluginClass<unknown[]>>[];

  /**
   * The name of the repository
   */
  repoName?: string;

  /**
   * The name of the author
   */
  authorName?: string;

  /**
   * The current branch of the project
   */
  currentBranch?: string;
}

export default class ReleaseContext extends ScriptContext<ReleaseContextConfig> {
  constructor(name: string, options: Partial<ReleaseContextOptions>) {
    super(name, options);

    if (!this.options.rootPath) {
      this.setOptions({ rootPath: process.cwd() });
    }

    if (!this.options.sourceBranch) {
      this.setOptions({
        sourceBranch:
          this.env.get('FE_RELEASE_BRANCH') ||
          this.env.get('FE_RELEASE_SOURCE_BRANCH') ||
          DEFAULT_SOURCE_BRANCH
      });
    }

    if (!this.options.releaseEnv) {
      this.setOptions({
        releaseEnv:
          this.env.get('FE_RELEASE_ENV') ||
          this.env.get('NODE_ENV') ||
          'development'
      });
    }
  }

  get rootPath(): string {
    return this.getOptions('rootPath');
  }

  get sourceBranch(): string {
    return this.getOptions('sourceBranch');
  }

  get releaseEnv(): string {
    return this.getOptions('releaseEnv');
  }

  get workspaces(): WorkspaceValue[] | undefined {
    return this.getOptions('workspaces.workspaces');
  }

  get workspace(): WorkspaceValue | undefined {
    return this.getOptions('workspaces.workspace');
  }

  setWorkspaces(workspaces: WorkspaceValue[]): void {
    this.options.workspaces = {
      ...this.options.workspaces,
      workspaces
    };
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
      ...this.getOptions(),
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
