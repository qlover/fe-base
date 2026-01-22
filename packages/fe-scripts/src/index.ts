/**
 * @module FeScripts
 * @description Collection of utility scripts for frontend project automation
 *
 * This module provides a set of pre-built scripts for common frontend development
 * tasks such as cleaning, committing, branch management, and project setup. These
 * scripts are designed to work with the scripts-context framework and can be easily
 * integrated into your project's workflow.
 *
 * Core functionality:
 * - Clean scripts: Project cleanup and maintenance
 *   - Clean build artifacts and temporary files
 *   - Clean Git branches (local and remote)
 *   - Selective cleaning with pattern matching
 *   - Safe deletion with confirmation prompts
 *
 * - Commit scripts: Git commit workflow automation
 *   - Interactive commit message creation
 *   - Conventional commit format support
 *   - Commit message validation
 *   - Pre-commit hook integration
 *
 * - Setup scripts: Project initialization and configuration
 *   - Husky setup for Git hooks
 *   - Lint-staged configuration
 *   - Commitlint setup
 *   - Pre-commit and pre-push hooks
 *
 * - Package scripts: Package management utilities
 *   - Check package dependencies
 *   - Validate package.json files
 *   - Detect outdated dependencies
 *   - Workspace package validation
 *
 * ### Exported Members
 *
 * **Scripts:**
 * - `clean`: Clean build artifacts and temporary files
 * - `cleanBranch`: Clean Git branches
 * - `commit`: Interactive commit message creation
 * - `setupHusky`: Setup Husky Git hooks
 * - `checkPackages`: Check and validate packages
 *
 * ### Basic Usage
 *
 * ```typescript
 * import { clean, commit, setupHusky } from '@qlover/fe-scripts';
 *
 * // Clean build artifacts
 * await clean({
 *   patterns: ['dist', 'build', '.cache'],
 *   dryRun: false
 * });
 *
 * // Create a commit
 * await commit({
 *   type: 'feat',
 *   scope: 'api',
 *   message: 'Add user authentication'
 * });
 *
 * // Setup Husky
 * await setupHusky({
 *   hooks: ['pre-commit', 'commit-msg']
 * });
 * ```
 *
 * ### Clean Script
 *
 * ```typescript
 * import { clean } from '@qlover/fe-scripts';
 *
 * // Clean specific patterns
 * await clean({
 *   patterns: ['dist/**', 'build/**', '*.log'],
 *   exclude: ['dist/assets'],
 *   dryRun: false,
 *   verbose: true
 * });
 *
 * // Dry run to preview what will be deleted
 * await clean({
 *   patterns: ['dist', 'build'],
 *   dryRun: true
 * });
 * ```
 *
 * ### Branch Cleanup
 *
 * ```typescript
 * import { cleanBranch } from '@qlover/fe-scripts';
 *
 * // Clean merged branches
 * await cleanBranch({
 *   remote: 'origin',
 *   exclude: ['main', 'develop'],
 *   dryRun: false
 * });
 *
 * // Clean local branches
 * await cleanBranch({
 *   local: true,
 *   merged: true,
 *   exclude: ['main', 'develop', 'feature/*']
 * });
 * ```
 *
 * ### Commit Workflow
 *
 * ```typescript
 * import { commit } from '@qlover/fe-scripts';
 *
 * // Interactive commit
 * await commit({
 *   interactive: true,
 *   types: ['feat', 'fix', 'docs', 'style', 'refactor'],
 *   scopes: ['api', 'ui', 'core']
 * });
 *
 * // Programmatic commit
 * await commit({
 *   type: 'fix',
 *   scope: 'auth',
 *   message: 'Fix login validation',
 *   body: 'Improved validation logic for email and password',
 *   breaking: false
 * });
 * ```
 *
 * ### Husky Setup
 *
 * ```typescript
 * import { setupHusky } from '@qlover/fe-scripts';
 *
 * // Setup with default hooks
 * await setupHusky({
 *   hooks: {
 *     'pre-commit': 'npx lint-staged',
 *     'commit-msg': 'npx commitlint --edit $1',
 *     'pre-push': 'npm test'
 *   }
 * });
 *
 * // Setup with custom configuration
 * await setupHusky({
 *   huskyDir: '.husky',
 *   hooks: {
 *     'pre-commit': 'npm run lint && npm run format'
 *   }
 * });
 * ```
 *
 * ### Package Validation
 *
 * ```typescript
 * import { checkPackages } from '@qlover/fe-scripts';
 *
 * // Check all packages
 * await checkPackages({
 *   workspaces: true,
 *   checkDependencies: true,
 *   checkVersions: true
 * });
 *
 * // Check specific packages
 * await checkPackages({
 *   packages: ['@myapp/core', '@myapp/ui'],
 *   checkOutdated: true
 * });
 * ```
 *
 * ### Integration with npm scripts
 *
 * ```json
 * {
 *   "scripts": {
 *     "clean": "fe-scripts clean",
 *     "clean:branches": "fe-scripts clean-branch",
 *     "commit": "fe-scripts commit",
 *     "setup": "fe-scripts setup-husky",
 *     "check": "fe-scripts check-packages"
 *   }
 * }
 * ```
 *
 * @see {@link https://github.com/qlover/fe-base/tree/main/packages/fe-scripts} for detailed documentation
 */
export * from './scripts';
