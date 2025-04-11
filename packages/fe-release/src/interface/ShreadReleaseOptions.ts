import type { FeReleaseConfig } from '@qlover/scripts-context';
import type { PluginClass, PluginTuple } from '../utils/tuple';
import type { PackageJson, UserInfoType } from '../type';

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
  plugins?: PluginTuple<PluginClass>[];

  /**
   * The workspace of the project
   */
  packageJson?: PackageJson;

  /**
   * The repository information
   */
  repoInfo?: UserInfoType;
}
