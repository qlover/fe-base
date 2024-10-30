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
   * @default [Bot Release] Branch:${branch}, Tag:${tagName}, Env:${env}
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

export class Shell {
  constructor(container?: { config?: { isDryRun?: boolean }; log?: Logger });
  exec(
    command: string,
    options?: {
      silent?: boolean;
      env?: Record<string, string>;
    },
    context?: Record<string, any>
  ): Promise<string>;
  run(command: string, options?: object, context?: object): Promise<string>;
  format(template: string, context: Record<string, any>): string;
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
}