export const defaultFeConfig: FeConfig = {
  protectedBranches: ['master', 'develop', 'main'],
  cleanFiles: [
    'dist',
    'node_modules',
    'yarn.lock',
    'package-lock.json',
    '.eslintcache',
    '*.log'
  ],
  commitlint: {
    extends: ['@commitlint/config-conventional']
  },
  release: {
    publishPath: '',
    autoMergeReleasePR: false,
    autoMergeType: 'squash',
    branchName: 'release-${env}-${branch}-${tagName}',
    PRTitle:
      '[${pkgName} Release] Branch:${branch}, Tag:${tagName}, Env:${env}',
    PRBody:
      '## Publish Details\n\n- 🏷️ Version: ${tagName}\n- 🌲 Branch: ${branch}\n- 🔧 Environment: ${env}\n\n## Changelog\n\n${changelog}\n\n## Notes\n\n- [ ] Please check if the version number is correct\n- [ ] Please confirm all tests have passed\n- [ ] Please confirm the documentation has been updated\n\n> This PR is auto created by release process, please contact the frontend team if there are any questions.',
    label: {
      color: '1A7F37',
      description: 'Release PR',
      name: 'CI-Release'
    },
    packagesDirectories: [],
    changePackagesLabel: 'changes:${name}'
  },
  envOrder: ['.env.local', '.env.production', '.env']
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
   * The path to publish the package
   *
   * @default ''
   */
  publishPath?: string;

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
