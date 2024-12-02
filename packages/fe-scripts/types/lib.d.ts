import { Logger } from '@qlover/fe-utils';
import { FeConfig } from './feConfig';
import { ReleaseOptions } from './scripts';

export type SearchConfigType = import('cosmiconfig').OptionsSync & {
  _default: any;
};

export class FeScriptContext<T> {
  logger: ScriptsLogger;
  shell: Shell;
  feConfig: FeConfig;
  env: Env;

  /**
   * @default `false`
   */
  dryRun: boolean;

  /**
   * @default `false`
   */
  verbose: boolean;

  options: T;

  constructor(scriptsOptions: Partial<FeScriptContext<T>>);
}

export type ReleaseContext = FeScriptContext<ReleaseOptions>;

export class ConfigSearch<T = FeConfig> {
  name: string;
  constructor(options: SearchConfigType);
  get config(): T;
  getSearchPlaces(): string[];
  get(options: { file?: string | false; dir?: string }): T;
  search(): T;
}

export class Dependencie {
  constructor(context: Partial<FeScriptContext<any>>);

  execPromise(command: string, silent?: boolean): Promise<string>;

  checkDependencyInstalled(
    packageName: string,
    global?: boolean
  ): Promise<{
    local: boolean;
    global: boolean;
  }>;

  getGlobalDependencyVersion(dependencyName: string): Promise<{
    version: string;
    scope: 'global';
  }>;

  getDependencyVersion(dependencyName: string): Promise<{
    version: string;
    scope: 'local';
  }>;

  checkWithInstall(packageName: string, global?: boolean): Promise<void>;

  install(packageName: string, global?: boolean): Promise<void>;
}

export class Env {
  constructor(options: { rootPath: string; logger?: Logger });

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
  remove(variable: string): void;

  /**
   * Destroy after obtaining a variable
   * @param varname
   */
  getDestroy(varname: keyof typeof process.env): string | undefined;

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

export class Release {}

export class ReleaseConfiger {
  /**
   * Constructs a new ReleaseConfiger instance.
   * @param context - The release context containing configuration and environment details.
   */
  constructor(context: ReleaseContext);

  /**
   * Retrieves user information such as repository and author name.
   * @returns An object containing the repository name and author name.
   */
  getUserInfo(): { repoName: string; authorName: string };

  /**
   * Retrieves package information based on a specified key.
   * @param key - The key to retrieve specific package information.
   * @returns The package information associated with the key.
   */
  getPkg(key?: string): any;

  /**
   * Retrieves the release branch name.
   * @param tagName - The tag name for the release.
   * @returns The release branch name.
   */
  getReleaseBranch(tagName: string): string;

  /**
   * Retrieves the release changelog options.
   * @returns The options for generating the release changelog.
   */
  getReleaseItChangelogOptions(): any;
  // 其他方法和属性
}

export class ReleasePRManager {
  /**
   * Constructs a new ReleasePRManager instance.
   * @param configer - The ReleaseConfiger instance for managing release configurations.
   */
  constructor(configer: ReleaseConfiger);

  /**
   * Creates a label for the release pull request.
   * @returns A promise that resolves to the label string.
   */
  createReleasePRLabel(): Promise<string>;

  /**
   * Creates a release pull request with the specified options.
   * @param options - The options for creating the release pull request.
   * @returns A promise that resolves to the pull request number.
   */
  createReleasePR(options: {
    tagName: string;
    releaseBranch: string;
    changelog: string;
    label: string;
  }): Promise<number>;

  /**
   * Automatically merges the release pull request.
   * @param prNumber - The pull request number.
   * @param releaseBranch - The release branch name.
   * @returns A promise that resolves when the merge is complete.
   */
  autoMergePR(prNumber: number, releaseBranch: string): Promise<void>;

  /**
   * Checks the status of the pull request.
   * @param prNumber - The pull request number.
   * @param releaseBranch - The release branch name.
   * @returns A promise that resolves when the check is complete.
   */
  checkedPR(prNumber: number, releaseBranch: string): Promise<void>;

  /**
   * Retrieves the pull request URL.
   * @param prNumber - The pull request number.
   * @returns The URL of the pull request.
   */
  getPRUrl(prNumber: number): string;
}

export class ReleaseUtil {
  /**
   * Validates if the provided value is a valid string.
   * @param value - The value to validate.
   * @returns True if the value is a valid string, otherwise false.
   */
  static isValidString(value: any): boolean;

  /**
   * Parses the pull request number from the output string.
   * @param output - The output string containing the pull request number.
   * @returns The parsed pull request number as a string.
   */
  static parserPRNumber(output: string): string;

  /**
   * Retrieves user information from the package and configuration.
   * @param pkg - The package information.
   * @param feConfig - The front-end configuration.
   * @returns An object containing the repository name and author name.
   */
  static getUserInfo(
    pkg: any,
    feConfig: FeConfig
  ): { repoName: string; authorName: string };

  /**
   * Retrieves the dry run pull request URL.
   * @param shell - The shell instance for executing commands.
   * @param number - The pull request number.
   * @returns A promise that resolves to the dry run pull request URL.
   */
  static getDryRrunPRUrl(shell: Shell, number: string): Promise<string>;

  /**
   * Merges two objects deeply.
   * @param target - The target object.
   * @param source - The source object.
   * @returns The merged object.
   */
  static deepMerge(target: any, source: any): any;
}
