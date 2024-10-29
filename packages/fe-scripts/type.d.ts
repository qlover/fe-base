declare module '@qlover/fe-scripts' {
  export type SearchConfigType = import('cosmiconfig').OptionsSync & {
    _default: any;
  };

  export type SerachConfig = {
    name: string;
    config: SearchConfigType;
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

  export type FeScriptsConfig = {
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
     * release-it config
     *
     * **this config propery is currently not supported! Using `release-it` native usage**
     * @default {}
     */
    releaseIt?: import('release-it').Config;

    /**
     * config of CI release
     */
    release?: FeScriptRelease;
  };
}
