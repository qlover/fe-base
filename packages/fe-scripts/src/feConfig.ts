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
        [key: string]: unknown;
      };
  /**
   * commitlint config
   *
   * @default { "extends": ["@commitlint/config-conventional"] }
   */
  commitlint?: import('@commitlint/types').UserConfig;

  /**
   * config of CI release
   *
   * scripts release
   */
  release?: FeReleaseConfig;

  /**
   * @default ['.env.local', '.env']
   */
  envOrder?: string[];
};

export type FeReleaseConfig = {
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
     * @default `1A7F37`
     */
    color?: string;

    /**
     * @default `Label for version update PRs`
     */
    description?: string;

    /**
     * @default `CI-Release`
     */
    name?: string;
  };

  /**
   * @default `changes:${name}`
   */
  changePackagesLabel?: string;

  /**
   * @default `[]`
   */
  packagesDirectories?: string[];
};
