/**
 * @module FeRelease
 * @description Frontend package release automation framework
 *
 * This module provides a comprehensive framework for automating the release
 * process of frontend packages. It includes tools for version management,
 * changelog generation, GitHub integration, and workspace management.
 *
 * Core Components:
 * - Release Management:
 *   - ReleaseContext: Environment and configuration management
 *   - ReleaseTask: Task execution and orchestration
 *   - ReleaseLabel: Version and label management
 *
 * - Changelog Generation:
 *   - GitChangeLog: Git-based changelog generation
 *   - GitChangelogFormatter: Changelog formatting utilities
 *   - GithubChangelog: GitHub-specific changelog features
 *
 * - Plugin System:
 *   - ScriptPlugin: Base plugin infrastructure
 *   - GitHub PR integration
 *   - Workspace management
 *
 * - Utility Functions:
 *   - Type definitions and helpers
 *   - Tuple manipulation
 *   - Resource loading
 *   - Factory functions
 *   - Argument processing
 *
 * @example Basic usage
 * ```typescript
 * import { ReleaseContext, ReleaseTask } from '@qlover/fe-release';
 *
 * // Create release context
 * const context = new ReleaseContext('my-package', {
 *   increment: 'patch',
 *   dryRun: false
 * });
 *
 * // Execute release task
 * const task = new ReleaseTask(context);
 * await task.exec();
 * ```
 *
 * @example Custom changelog formatting
 * ```typescript
 * import { GitChangeLog, GitChangelogFormatter } from '@qlover/fe-release';
 *
 * class CustomFormatter extends GitChangelogFormatter {
 *   format(commits) {
 *     // Custom formatting logic
 *     return formattedChangelog;
 *   }
 * }
 *
 * const changelog = new GitChangeLog({
 *   formatter: new CustomFormatter()
 * });
 * ```
 *
 * @example Plugin implementation
 * ```typescript
 * import { ScriptPlugin } from '@qlover/fe-release';
 *
 * class CustomPlugin extends ScriptPlugin {
 *   async onExec() {
 *     // Custom release steps
 *     await this.step({
 *       label: 'Custom step',
 *       task: async () => {
 *         // Implementation
 *       }
 *     });
 *   }
 * }
 * ```
 */
export { default as ReleaseContext } from './implments/ReleaseContext';
export { default as ReleaseTask } from './implments/ReleaseTask';
export * from './implments/ReleaseLabel';
export * from './implments/changelog/GitChangeLog';
export * from './implments/changelog/GitChangelogFormatter';
export * from './plugins/githubPR/GithubChangelog';
export { ScriptPlugin } from '@qlover/scripts-context';
export * from './type';
export * from './utils/tuple';
export * from './utils/loader';
export * from './utils/factory';
export * from './utils/args';
