import type { FeReleaseConfig } from '@qlover/scripts-context';
import type { PluginClass, PluginTuple } from '../utils/tuple';

/**
 * This is the shared options for the release.
 *
 * extends `FeReleaseConfig`
 */
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
