import { Logger } from '@qlover/fe-utils';
import { FeConfig } from '../index';
import { Shell } from '../lib';

export interface ScriptContext {
  logger: Logger;
  shell: Shell;
}
export interface CleanOptions extends ScriptContext {
  /**
   * Files to be cleaned
   * @default from fe-config.cleanFiles
   */
  files?: string[];
  recursion?: boolean;
  /**
   * Whether to use .gitignore file to determine files to be deleted
   */
  gitignore?: boolean;
  /**
   * Whether to run in dry mode (no actual deletion)
   */
  dryrun?: boolean;
}

export interface CleanBranchOptions extends ScriptContext {
  /**
   * Protected branches that should not be deleted
   * @default from fe-config.protectedBranches
   */
  protectedBranches?: string[];
}

export interface CommitOptions extends ScriptContext {
  /**
   * Absolute path to cz-conventional-changelog
   */
  defaultCzPath?: string;
}

export interface SetupHuskyOptions extends ScriptContext {
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

export interface Script<T = Options> {
  (options: T): Promise<void>;
}

export declare const clean: Script<CleanOptions>;
export declare const cleanBranch: Script<CleanBranchOptions>;
export declare const commit: Script<CommitOptions>;
export declare const setupHusky: Script<SetupHuskyOptions>;
export declare const searchEnv: Script<SearchEnvOptions>;

export interface Scripts {
  clean: (options?: CleanOptions) => Promise<void>;
  cleanBranch: (options?: CleanBranchOptions) => Promise<void>;
  commit: (options?: CommitOptions) => Promise<void>;
  setupHusky: (options?: SetupHuskyOptions) => Promise<void>;
  searchEnv: (options?: SearchEnvOptions) => Promise<void>;
}

export default Scripts;
