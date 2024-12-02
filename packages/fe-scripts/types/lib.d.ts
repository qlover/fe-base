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
