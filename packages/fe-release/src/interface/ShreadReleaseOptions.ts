import type { FeReleaseConfig } from '@qlover/scripts-context';
import type { PluginClass, PluginTuple } from '../utils/tuple';

export interface SharedReleaseOptions extends FeReleaseConfig {
  /**
   * The source branch of the project
   *
   * default:
   * - first, get from `FE_RELEASE_SOURCE_BRANCH`
   * - second, get from `FE_RELEASE_BRANCH`
   * - `master`
   *
   */
  sourceBranch?: string;

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
   * The root path of the project
   *
   * @default `process.cwd()`
   */
  rootPath?: string;

  /**
   * Whether to publish a PR
   *
   * @default `false`
   */
  releasePR?: boolean;

  /**
   * Plugins
   */
  plugins?: PluginTuple<PluginClass<unknown[]>>[];

  repoName?: string;
  authorName?: string;

  currentBranch?: string;

  /**
   * Merge publish?
   *
   * If true, the PR will be created for all workspaces, instead of creating one PR per workspace.
   *
   * @default `false`
   */
  mergePublish?: boolean;
}
