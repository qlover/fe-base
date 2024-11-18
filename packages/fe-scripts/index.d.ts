import { Logger } from '@qlover/fe-utils';

export type SearchConfigType = import('cosmiconfig').OptionsSync & {
  _default: any;
};

export type FeScriptRelease = {
  /**
   * Whether to automatically merge PR when creating and publishing
   *
   * @default true
   */
  autoMergeReleasePR?: boolean;

  /**
   * PR auto merged type
   *
   * @default squash
   */
  autoMergeType?: 'merge' | 'squash' | 'rebase';
  /**
   * Create the branch name of PR when publishing
   *
   * @default ${env}-${branch}-${tagName}
   */
  branchName?: string;
  /**
   * Create a title for publishing PR
   *
   * @default [${pkgName} Release] Branch:${branch}, Tag:${tagName}, Env:${env}
   */
  PRTitle?: string;
  /**
   * Create a body for publishing PR
   *
   * @default This PR includes version bump to ${tagName}
   */
  PRBody?: string;

  /**
   * Create a label for publishing PR
   */
  label?: {
    /**
     * hex color string
     *
     * @default 1A7F37
     */
    color?: string;

    /**
     * @default Label for version update PRs
     */
    description?: string;

    /**
     * @default CI-Release
     */
    name?: string;
  };
};

export type FeConfig = {
  /**
   * Run `fe-clean-branch` to exclude branches
   *
   * @default ["master", "develop", "main"]
   */
  protectedBranches?: string[];
  /**
   * Run `fe-clean` to includes files
   *
   * @default ["dist","node_modules","yarn.lock","package-lock.json",".eslintcache","*.log"]
   */
  cleanFiles?: string[];
  /**
   * Use author name when create merge PR
   *
   * @default `package.json -> autor`
   */
  author?:
    | string
    | {
        name?: string;
        email?: string;
      };
  /**
   * Use repo info when create merge PR
   *
   * @default `package.json -> repository`
   */
  repository?:
    | string
    | {
        url?: string;
        [key: string]: string;
      };
  /**
   * commitlint config
   *
   * @default { "extends": ["@commitlint/config-conventional"] }
   */
  commitlint?: import('@commitlint/types').UserConfig;

  /**
   * config of CI release
   */
  release?: FeScriptRelease;
};

export class ConfigSearch {
  constructor(options: SearchConfigType);
  get config(): FeConfig;
  getSearchPlaces(): string[];
  get(options: { file?: string | false; dir?: string }): Record<string, any>;
  search(): Record<string, any>;
}

export class ScriptsLogger extends Logger {
  /**
   * add prefix to value, color to level
   *
   * @description
   *  - INFO => blue
   *  - WARN => yellow
   *  - ERROR => red
   *  - DEBUG => green
   * @override
   * @param value
   */
  prefix(value: string): string;
}

export type ShellExecOptions = {
  /**
   * whether to silent
   */
  silent?: boolean;

  /**
   * environment variables
   */
  env?: Record<string, string>;

  /**
   * empty run result
   */
  dryRunResult?: unknown;

  /**
   * whether to dry run
   * override shell config.isDryRun
   */
  dryRun?: boolean;

  /**
   * whether to external command
   */
  external?: boolean;

  /**
   * template context
   */
  context?: Record<string, any>;
};

export class Shell {
  constructor(container?: { config?: { isDryRun?: boolean }; log?: Logger });
  exec(command: string, options?: ShellExecOptions): Promise<string>;
  run(command: string, options?: ShellExecOptions): Promise<string>;
  format(template: string, context: Record<string, never>): string;
}

export class Env {
  constructor(options: { rootPath: string; log?: Logger });

  /**
   * load env file
   * @param param0
   */
  load({
    preloadList,
    rootPath
  }: {
    preloadList?: string[];
    rootPath?: string;
  }): void;

  /**
   * clear env variable
   * @param variable
   */
  removeEnvVariable(variable: string): void;

  /**
   * Destroy after obtaining a variable
   * @param varname
   */
  getEnvDestroy(varname: keyof typeof process.env): string | undefined;

  /**
   * get env variable
   * @param {string} variable
   * @returns {string | undefined}
   */
  get(variable: keyof typeof process.env): string | undefined;

  /**
   * set env variable
   * @param {string} variable
   * @param {string} value
   */
  set(variable: string, value: string): void;
}

export interface ReleaseConfig {
  /**
   * Whether to create release
   */
  isCreateRelease?: boolean;
  log: Logger;
  shell: Shell;
  feConfig: FeConfig;
  /**
   * only `npm publish <directory>`
   * don't release directory
   */
  publishPath?: string;
}

/**
 * Release base class that handles common release functionality
 */
export class ReleaseBase {
  constructor(config: ReleaseConfig);

  feConfig: FeConfig;
  log: Logger;
  shell: Shell;
  isCreateRelease?: boolean;
  /** GitHub access token */
  ghToken: string;
  /** NPM access token */
  npmToken: string;
  /** Current branch name */
  branch: string;
  /** Current environment (e.g. 'production', 'staging') */
  env?: string;
  /** GitHub user information */
  userInfo: import('@octokit/rest').User;
  /** Current package version */
  pkgVersion: string;
  /** GitHub API client */
  octokit: import('@octokit/rest').Octokit;

  /**
   * Get release configuration value by path
   * @param path Configuration path
   * @param defaultValue Default value if path not found
   */
  getRelease(path: string, defaultValue: any): any;

  /** Get GitHub user information */
  getUserInfo(): Promise<import('@octokit/rest').User>;

  /** Initialize GitHub API client */
  getOctokit(): Promise<import('@octokit/rest').Octokit>;

  /** Get release-it configuration */
  getReleaseItConfig(): Record<string, any> | undefined;

  /**
   * Get release branch name
   * @param tagName Release tag name
   */
  getReleaseBranch(tagName: string): string;

  /**
   * Get release PR title
   * @param tagName Release tag name
   */
  getReleasePRTitle(tagName: string): string;

  /**
   * Get release PR body content
   * @param options Options containing tag name and changelog
   */
  getReleasePRBody(options: { tagName: string; changelog: string }): string;

  /** Get package publish path */
  getPublishPath(): string;

  /**
   * Get package.json value by key
   * @param key Package.json key path
   */
  getPkg(key?: string): any;

  /**
   * Get release feature configuration
   * @param path Configuration path
   * @param defaultValue Default value if path not found
   */
  getReleaseFeConfig<T>(path: keyof FeScriptRelease, defaultValue: T): T;

  /**
   * Initialize release configuration
   * @param config Release configuration
   */
  initConfig(config: ReleaseConfig): FeConfig;
}

/**
 * Main release class that handles the release process
 */
export class Release {
  constructor(config: ReleaseConfig);

  readonly config: ReleaseBase;
  readonly log: Logger;
  readonly shell: Shell;
  /** Environment variables for release-it */
  readonly releaseItEnv: Record<string, string>;
  /** Whether running in dry-run mode */
  readonly dryRun: boolean;

  /**
   * Extract PR number from command output
   * @param output Command output containing PR number
   */
  getPRNumber(output: string): number;

  /** Compose release-it command with options */
  componseReleaseItCommand(): string;

  /**
   * Execute release-it process
   * @param releaseItOptions Additional release-it options
   */
  releaseIt(releaseItOptions?: Record<string, any>): Promise<{
    name: string;
    changelog: string;
    latestVersion: string;
    version: string;
  }>;

  /** Check if tag already exists */
  checkTag(): Promise<void>;

  /** Verify NPM authentication */
  checkNpmAuth(): Promise<void>;

  /** Verify publish path exists */
  checkPublishPath(): Promise<void>;

  /** Create changelog and determine version */
  createChangelogAndVersion(): Promise<{
    name: string;
    changelog: string;
    latestVersion: string;
    version: string;
  }>;

  /** Create release branch */
  createReleaseBranch(): Promise<{
    tagName: string;
    releaseBranch: string;
  }>;

  /** Create PR label if it doesn't exist */
  createPRLabel(): Promise<void>;

  /**
   * Create release pull request
   * @param tagName Release tag name
   * @param releaseBranch Release branch name
   * @param releaseResult Release result containing changelog
   */
  createReleasePR(
    tagName: string,
    releaseBranch: string,
    releaseResult: {
      changelog: string;
    }
  ): Promise<number>;

  /**
   * Auto merge pull request
   * @param prNumber Pull request number
   */
  autoMergePR(prNumber: number): Promise<void>;

  /**
   * Check pull request status
   * @param prNumber Pull request number
   * @param releaseBranch Release branch name
   */
  checkedPR(prNumber: number, releaseBranch: string): Promise<void>;

  /** Execute complete release process */
  publish(): Promise<{
    name: string;
    changelog: string;
    latestVersion: string;
    version: string;
  }>;
}
