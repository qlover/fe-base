/**
 * @module FeReleaseDefaults
 * @description Default configuration values for fe-release
 *
 * This module provides default values and constants used throughout
 * the fe-release framework. These values define the default behavior
 * for version increments, branch names, PR settings, and workspace
 * configuration.
 *
 * Categories:
 * - Version Management: Increment types and branch names
 * - PR Configuration: Titles, merge settings, and templates
 * - Workspace Settings: Limits and separators
 * - Template Configuration: Delimiters and formats
 */

/**
 * Default version increment type
 *
 * Uses 'patch' for minimal version changes (0.0.x)
 * Following semver conventions for backward compatibility
 */
export const DEFAULT_INCREMENT = 'patch';

/**
 * Default source branch for releases
 *
 * Uses 'master' as the default source branch
 * Can be overridden via configuration or CLI options
 */
export const DEFAULT_SOURCE_BRANCH = 'master';

/**
 * Whether to automatically merge release PRs
 *
 * Disabled by default for safety
 * Enable via configuration for automated workflows
 */
export const DEFAULT_AUTO_MERGE_RELEASE_PR = false;

/**
 * Default merge strategy for auto-merged PRs
 *
 * Uses 'squash' to maintain clean history
 * Options: 'merge', 'squash', 'rebase'
 */
export const DEFAULT_AUTO_MERGE_TYPE = 'squash';

/**
 * Path to package manifest file
 *
 * Standard location for npm package metadata
 * Used for version management and workspace detection
 */
export const MANIFEST_PATH = 'package.json';

/**
 * Default PR title template
 *
 * Variables:
 * - ${env}: Release environment
 * - ${pkgName}: Package name
 * - ${tagName}: Release tag
 *
 * @example
 * // With variables:
 * // Release production my-package v1.0.0
 */
export const DEFAULT_PR_TITLE = 'Release ${env} ${pkgName} ${tagName}';

/**
 * Template opening delimiter
 *
 * Used for variable substitution in templates
 * Paired with TEMPLATE_CLOSE
 */
export const TEMPLATE_OPEN = '{{';

/**
 * Template closing delimiter
 *
 * Used for variable substitution in templates
 * Paired with TEMPLATE_OPEN
 */
export const TEMPLATE_CLOSE = '}}';

/**
 * Maximum number of workspaces to process
 *
 * Limits concurrent workspace operations
 * Prevents resource exhaustion in large monorepos
 */
export const MAX_WORKSPACE = 3;

/**
 * Separator for multi-workspace identifiers
 *
 * Used when combining multiple workspace names
 * Example: workspace1_workspace2_workspace3
 */
export const MULTI_WORKSPACE_SEPARATOR = '_';

/**
 * Separator for workspace version strings
 *
 * Used in workspace@version format
 * Example: my-package@1.0.0
 */
export const WORKSPACE_VERSION_SEPARATOR = '@';

/**
 * Template for batch PR body sections
 *
 * Variables:
 * - ${name}: Package name
 * - ${version}: Release version
 * - ${changelog}: Package changelog
 *
 * @example
 * // With variables:
 * // ## my-package 1.0.0
 * // - Feature: Added new functionality
 * // - Fix: Fixed bug
 */
export const BATCH_PR_BODY = '\n## ${name} ${version}\n${changelog}\n';
