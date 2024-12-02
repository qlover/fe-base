import { Logger } from '@qlover/fe-utils';
import { FeConfig } from '../index';
import { FeScriptContext, Shell } from '../lib';

export interface ScriptContext {
  logger: Logger;
  shell: Shell;
  feConfig: FeConfig;
}
export interface ReleaseOptions {
  path?: string;
  mode?: string;
  releaseBranch?: string;
  releaseEnv?: string;
}
export interface CleanOptions {
  /**
   * Files to be cleaned
   * @default `fe-config.cleanFiles`
   */
  files?: string[];
  /**
   * Whether to recursively clean files
   * @default `false`
   */
  recursion?: boolean;
  /**
   * Whether to use .gitignore file to determine files to be deleted
   * @default `false`
   */
  gitignore?: boolean;
}

export interface CleanBranchOptions {
  /**
   * Protected branches that should not be deleted
   * @default `fe-config.protectedBranches``
   */
  protectedBranches?: string[];
}

export interface CommitOptions {
  /**
   * Absolute path to cz-conventional-changelog
   */
  defaultCzPath?: string;
}

export interface SetupHuskyOptions {
  /**
   * Path to commitlint config
   */
  commitlintPath?: string;
  /**
   * Whether to force setup even if husky is already installed
   * @default false
   */
  force?: boolean;
}

export interface SearchEnvOptions {
  /**
   * start search directory, default is process.cwd()
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * List of environment files to search for
   * @default ['.env.local', '.env']
   */
  preloadList?: string[];
  logger?: Logger;
  /**
   * Maximum search depth, default is 5, max is 8
   * @default 5
   */
  maxDepth?: number;
}

export interface ReleaseOptions extends ScriptContext {}
export interface Script<T = Options> {
  (options: T): Promise<void>;
}

export declare const clean: Script<CleanOptions>;
export declare const cleanBranch: Script<CleanBranchOptions>;
export declare const commit: Script<CommitOptions>;
export declare const setupHusky: Script<SetupHuskyOptions>;
export declare const searchEnv: Script<SearchEnvOptions>;
export declare const release: Script<ReleaseOptions>;

export interface Scripts {
  clean: (options?: CleanOptions) => Promise<void>;
  cleanBranch: (options?: CleanBranchOptions) => Promise<void>;
  commit: (options?: CommitOptions) => Promise<void>;
  setupHusky: (options?: SetupHuskyOptions) => Promise<void>;
  searchEnv: (options?: SearchEnvOptions) => Promise<void>;
  release: (options?: ReleaseOptions) => Promise<void>;
}

export default Scripts;
