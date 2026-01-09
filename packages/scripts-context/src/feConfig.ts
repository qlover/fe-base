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
    branchName: 'release-${pkgName}-${tagName}',
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

export interface FeConfig {
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

  /**
   * Allow additional custom properties for script-specific configurations
   *
   * This enables users to add custom configuration properties for their
   * specific scripts without modifying the core FeConfig type definition.
   *
   * @example
   * ```typescript
   * const config: FeConfig = {
   *   protectedBranches: ['main'],
   *   'my-script': {
   *     customOption: 'value'
   *   }
   * };
   * ```
   */
  [key: string]: unknown;
}

/**
 * Configuration interface for automated release process management
 *
 * Core concept:
 * Defines comprehensive configuration options for automated release
 * processes, including PR management, package publishing, and
 * release workflow customization.
 *
 * Main features:
 * - PR management: Automated pull request creation and management
 *   - Dynamic branch naming with template variables
 *   - Customizable PR titles and descriptions
 *   - Automatic PR labeling and categorization
 *   - Configurable auto-merge behavior and strategies
 *
 * - Package publishing: Flexible package distribution configuration
 *   - Custom publish paths for different environments
 *   - Multi-package directory support for monorepos
 *   - Package-specific labeling and tracking
 *   - Environment-aware publishing strategies
 *
 * - Release workflow: Comprehensive release process control
 *   - Template-based content generation
 *   - Environment-specific configurations
 *   - Integration with CI/CD pipelines
 *   - Automated changelog and version management
 *
 * Design considerations:
 * - All properties are optional for maximum flexibility
 * - Template variables support dynamic content generation
 * - Environment-aware configuration for different deployment stages
 * - Integration with GitHub and other Git hosting platforms
 * - Support for both single-package and monorepo scenarios
 *
 * Template variables:
 * - `${pkgName}`: Package name from package.json
 * - `${tagName}`: Release version tag
 * - `${env}`: Release environment (development, staging, production)
 * - `${branch}`: Source branch name
 * - `${name}`: Package name for labeling
 * - `${changelog}`: Generated changelog content
 *
 * @example Basic release configuration
 * ```typescript
 * const releaseConfig: FeReleaseConfig = {
 *   autoMergeReleasePR: true,
 *   autoMergeType: 'squash',
 *   branchName: 'release-${pkgName}-${tagName}'
 * };
 * ```
 *
 * @example Advanced configuration with custom templates
 * ```typescript
 * const releaseConfig: FeReleaseConfig = {
 *   publishPath: './dist',
 *   autoMergeReleasePR: false,
 *   branchName: 'feat/release-${pkgName}-v${tagName}',
 *   PRTitle: '🚀 Release ${pkgName} v${tagName}',
 *   PRBody: '## Release ${pkgName} v${tagName}\n\n${changelog}',
 *   label: {
 *     name: 'release',
 *     color: '1A7F37',
 *     description: 'Automated release'
 *   }
 * };
 * ```
 *
 * @example Monorepo configuration
 * ```typescript
 * const releaseConfig: FeReleaseConfig = {
 *   packagesDirectories: ['packages/*', 'apps/*'],
 *   changePackagesLabel: 'changes:${name}',
 *   autoMergeReleasePR: true
 * };
 * ```
 */
export interface FeReleaseConfig {
  /**
   * The path to publish the package
   *
   * Core concept:
   * Specifies the directory path where the package should be
   * published, allowing for custom distribution locations
   * and environment-specific publishing strategies.
   *
   * Publishing behavior:
   * - Overrides default package.json publishConfig
   * - Supports both relative and absolute paths
   * - Used by npm publish and other distribution tools
   * - Enables environment-specific publishing locations
   * - Supports custom registry and distribution strategies
   *
   * Use cases:
   * - Custom npm registry publishing
   * - Environment-specific package distribution
   * - Private package repository publishing
   * - Alternative distribution platforms
   * - Testing and staging package distribution
   *
   * @optional
   * @default `''`
   * @example Basic publish path
   * ```typescript
   * const config: FeReleaseConfig = {
   *   publishPath: './dist'
   * };
   * ```
   *
   * @example Custom registry
   * ```typescript
   * const config: FeReleaseConfig = {
   *   publishPath: '@myorg/registry'
   * };
   * ```
   */
  publishPath?: string;

  /**
   * Whether to automatically merge PR when creating and publishing
   *
   * Core concept:
   * Controls whether release pull requests should be automatically
   * merged after successful validation, enabling fully automated
   * release workflows.
   *
   * Auto-merge behavior:
   * - Merges PR after all checks pass
   * - Uses specified auto-merge type (merge/squash/rebase)
   * - Triggers post-merge release actions
   * - Enables continuous deployment workflows
   * - Reduces manual intervention in release process
   *
   * Workflow integration:
   * - Integrates with GitHub auto-merge features
   * - Supports CI/CD pipeline automation
   * - Enables fully automated release processes
   * - Reduces release cycle time
   * - Maintains release quality through automated checks
   *
   * @optional
   * @default `false`
   * @example Enable auto-merge
   * ```typescript
   * const config: FeReleaseConfig = {
   *   autoMergeReleasePR: true,
   *   autoMergeType: 'squash'
   * };
   * ```
   *
   * @example Manual review required
   * ```typescript
   * const config: FeReleaseConfig = {
   *   autoMergeReleasePR: false
   * };
   * ```
   */
  autoMergeReleasePR?: boolean;

  /**
   * PR auto-merge strategy for release pull requests
   *
   * Core concept:
   * Defines the merge strategy used when automatically merging
   * release pull requests, affecting commit history and
   * repository structure.
   *
   * Merge strategies:
   * - merge: Creates merge commit with branch history
   * - squash: Combines all commits into single commit
   * - rebase: Replays commits on target branch
   *
   * Strategy considerations:
   * - merge: Preserves complete branch history
   * - squash: Creates clean, linear history
   * - rebase: Maintains chronological order
   * - Affects commit message and history structure
   * - Influences repository maintenance and debugging
   *
   * @optional
   * @default `'squash'`
   * @example Squash merge
   * ```typescript
   * const config: FeReleaseConfig = {
   *   autoMergeType: 'squash'
   * };
   * ```
   *
   * @example Preserve history
   * ```typescript
   * const config: FeReleaseConfig = {
   *   autoMergeType: 'merge'
   * };
   * ```
   */
  autoMergeType?: 'merge' | 'squash' | 'rebase';

  /**
   * Template for creating release branch names
   *
   * Core concept:
   * Defines the naming pattern for release branches using
   * template variables, enabling consistent and descriptive
   * branch naming across different packages and environments.
   *
   * Template variables:
   * - `${pkgName}`: Package name from package.json
   * - `${tagName}`: Release version tag
   * - `${env}`: Release environment
   * - `${branch}`: Source branch name
   *
   * Branch naming patterns:
   * - Descriptive names for easy identification
   * - Consistent format across all releases
   * - Environment and package-specific naming
   * - Supports Git branch naming conventions
   * - Enables automated branch management
   *
   * @optional
   * @default `'release-${pkgName}-${tagName}'`
   * @example Basic branch naming
   * ```typescript
   * const config: FeReleaseConfig = {
   *   branchName: 'release-${pkgName}-${tagName}'
   * };
   * ```
   *
   * @example Environment-aware naming
   * ```typescript
   * const config: FeReleaseConfig = {
   *   branchName: 'release/${env}/${pkgName}-${tagName}'
   * };
   * ```
   */
  branchName?: string;

  /**
   * Template for release pull request titles
   *
   * Core concept:
   * Defines the title format for release pull requests using
   * template variables, providing clear and informative
   * PR titles for release management.
   *
   * Title components:
   * - Package name for identification
   * - Release version for version tracking
   * - Environment for deployment context
   * - Source branch for change tracking
   * - Consistent formatting for automation
   *
   * Template variables:
   * - `${pkgName}`: Package name from package.json
   * - `${tagName}`: Release version tag
   * - `${env}`: Release environment
   * - `${branch}`: Source branch name
   *
   * @optional
   * @default `'[${pkgName} Release] Branch:${branch}, Tag:${tagName}, Env:${env}'`
   * @example Basic PR title
   * ```typescript
   * const config: FeReleaseConfig = {
   *   PRTitle: '[${pkgName} Release] v${tagName}'
   * };
   * ```
   *
   * @example Detailed PR title
   * ```typescript
   * const config: FeReleaseConfig = {
   *   PRTitle: '🚀 Release ${pkgName} v${tagName} (${env})'
   * };
   * ```
   */
  PRTitle?: string;

  /**
   * Template for release pull request body content
   *
   * Core concept:
   * Defines the content template for release pull request
   * descriptions, providing comprehensive release information
   * and automated content generation.
   *
   * Content sections:
   * - Release details and metadata
   * - Generated changelog content
   * - Review checklist and notes
   * - Environment and version information
   * - Automated process notifications
   *
   * Template variables:
   * - `${tagName}`: Release version tag
   * - `${branch}`: Source branch name
   * - `${env}`: Release environment
   * - `${changelog}`: Generated changelog content
   * - `${pkgName}`: Package name
   *
   * @optional
   * @default Comprehensive PR body template with changelog
   * @example Simple PR body
   * ```typescript
   * const config: FeReleaseConfig = {
   *   PRBody: 'Release ${pkgName} v${tagName}\n\n${changelog}'
   * };
   * ```
   *
   * @example Detailed PR body
   * ```typescript
   * const config: FeReleaseConfig = {
   *   PRBody: `
   * ## Release ${pkgName} v${tagName}
   *
   * **Environment:** ${env}
   * **Branch:** ${branch}
   *
   * ### Changes
   * ${changelog}
   *
   * ### Checklist
   * - [ ] Version number is correct
   * - [ ] All tests pass
   * - [ ] Documentation updated
   * `
   * };
   * ```
   */
  PRBody?: string;

  /**
   * Configuration for release pull request labels
   *
   * Core concept:
   * Defines the label configuration for release pull requests,
   * enabling automated categorization and visual identification
   * of release-related PRs.
   *
   * Label features:
   * - Automated label application
   * - Customizable label appearance
   * - Consistent release identification
   * - Integration with GitHub labeling system
   * - Support for custom label descriptions
   *
   * Label properties:
   * - name: Label identifier and display name
   * - color: Hexadecimal color code for visual distinction
   * - description: Label description for documentation
   *
   * @optional
   * @example Basic label configuration
   * ```typescript
   * const config: FeReleaseConfig = {
   *   label: {
   *     name: 'release',
   *     color: '1A7F37',
   *     description: 'Automated release PR'
   *   }
   * };
   * ```
   *
   * @example Custom label
   * ```typescript
   * const config: FeReleaseConfig = {
   *   label: {
   *     name: 'CI-Release',
   *     color: '0366D6',
   *     description: 'Release created by CI/CD'
   *   }
   * };
   * ```
   */
  label?: {
    /**
     * Hexadecimal color code for label appearance
     *
     * Color format: 6-character hex string without '#'
     * Used for visual distinction in GitHub interface
     * Supports standard web color codes
     *
     * @optional
     * @default `'1A7F37'`
     * @example Green color
     * ```typescript
     * color: '1A7F37'
     * ```
     *
     * @example Blue color
     * ```typescript
     * color: '0366D6'
     * ```
     */
    color?: string;

    /**
     * Descriptive text for label documentation
     *
     * Provides context about the label's purpose
     * Used in GitHub label management interface
     * Helps team members understand label usage
     *
     * @optional
     * @default `'Release PR'`
     * @example
     * ```typescript
     * description: 'Automated release pull request'
     * ```
     */
    description?: string;

    /**
     * Label name for identification and display
     *
     * Used as the primary identifier for the label
     * Displayed in GitHub PR interface
     * Should be descriptive and consistent
     *
     * @optional
     * @default `'CI-Release'`
     * @example
     * ```typescript
     * name: 'release'
     * ```
     */
    name?: string;
  };

  /**
   * Template for package change labels in monorepos
   *
   * Core concept:
   * Defines the naming pattern for labels that identify
   * which packages have changed in monorepo releases,
   * enabling targeted review and deployment.
   *
   * Label usage:
   * - Applied to PRs when specific packages change
   * - Enables package-specific review processes
   * - Supports selective deployment strategies
   * - Improves monorepo change tracking
   * - Facilitates team collaboration and review
   *
   * Template variables:
   * - `${name}`: Package name for label identification
   *
   * @optional
   * @default `'changes:${name}'`
   * @example Basic change label
   * ```typescript
   * const config: FeReleaseConfig = {
   *   changePackagesLabel: 'changes:${name}'
   * };
   * ```
   *
   * @example Custom change label
   * ```typescript
   * const config: FeReleaseConfig = {
   *   changePackagesLabel: 'package:${name}'
   * };
   * ```
   */
  changePackagesLabel?: string;

  /**
   * Directories containing packages for monorepo releases
   *
   * Core concept:
   * Specifies the directories that contain packages for
   * monorepo release management, enabling selective
   * package discovery and release coordination.
   *
   * Directory patterns:
   * - Supports glob patterns for flexible matching
   * - Enables selective package inclusion
   * - Supports nested directory structures
   * - Facilitates monorepo organization
   * - Enables workspace-specific configurations
   *
   * Use cases:
   * - Monorepo package discovery
   * - Selective package releases
   * - Workspace-specific configurations
   * - Multi-package coordination
   * - Dependency-aware releases
   *
   * @optional
   * @default `[]`
   * @example Basic package directories
   * ```typescript
   * const config: FeReleaseConfig = {
   *   packagesDirectories: ['packages/*']
   * };
   * ```
   *
   * @example Multiple package directories
   * ```typescript
   * const config: FeReleaseConfig = {
   *   packagesDirectories: ['packages/*', 'apps/*', 'libs/*']
   * };
   * ```
   */
  packagesDirectories?: string[];
}
