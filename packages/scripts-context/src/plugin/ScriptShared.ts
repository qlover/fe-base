import { Env } from '@qlover/env-loader';

export interface ScriptShared {
  /**
   * 从 fe-config 加载的根属性配置
   *
   * - release, 那么就是 fe-config 中的 release
   */
  rootPropName?: string | string[];

  /**
   * 环境变量
   */
  env?: Env;

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
   * The root path of the project
   *
   * @default `process.cwd()`
   */
  rootPath?: string;
}
