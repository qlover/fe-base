/**
 * @module ReleaseContext
 * @description Core context management for release operations
 *
 * This module provides the central context management for release operations,
 * handling configuration, environment variables, workspace management, and
 * package information. It extends the base ScriptContext with release-specific
 * functionality.
 *
 * Core Features:
 * - Environment variable management
 * - Workspace configuration
 * - Package.json access
 * - Template context generation
 * - Changeset CLI integration
 *
 * @example Basic usage
 * ```typescript
 * const context = new ReleaseContext('my-package', {
 *   rootPath: '/path/to/project',
 *   sourceBranch: 'main',
 *   releaseEnv: 'production'
 * });
 *
 * // Access package info
 * const version = context.getPkg('version');
 *
 * // Generate template context
 * const templateData = context.getTemplateContext();
 * ```
 *
 * @example Workspace management
 * ```typescript
 * // Set workspace configuration
 * context.setWorkspaces([{
 *   name: 'package-a',
 *   version: '1.0.0',
 *   path: 'packages/a'
 * }]);
 *
 * // Access workspace info
 * const currentWorkspace = context.workspace;
 * ```
 *
 * @example Changeset integration
 * ```typescript
 * // Run changeset commands
 * await context.runChangesetsCli('version', ['--snapshot', 'alpha']);
 * ```
 */
import type { TemplateContext } from '../type';
import get from 'lodash/get';
import { DEFAULT_SOURCE_BRANCH } from '../defaults';
import {
  WorkspacesProps,
  WorkspaceValue
} from '../plugins/workspaces/Workspaces';
import {
  FeReleaseConfig,
  ScriptContext,
  ScriptContextInterface,
  ScriptSharedInterface
} from '@qlover/scripts-context';
import { GithubPRProps } from '../plugins/githubPR/GithubPR';
import { PluginClass, PluginTuple } from '../utils/tuple';

export interface ReleaseContextOptions
  extends ScriptContextInterface<ReleaseContextConfig> {}

export interface ReleaseContextConfig
  extends FeReleaseConfig,
    ScriptSharedInterface {
  /**
   * The github PR of the project
   * @private
   */
  githubPR?: GithubPRProps;

  /**
   * The workspaces of the project
   * @private
   */
  workspaces?: WorkspacesProps;

  /**
   * The environment of the project
   *
   * default:
   * - first, get from `FE_RELEASE_ENV`
   * - second, get from `NODE_ENV`
   * - `development`
   */
  releaseEnv?: string;

  /**
   * Plugins
   */
  plugins?: PluginTuple<PluginClass<unknown[]>>[];

  /**
   * The name of the repository
   */
  repoName?: string;

  /**
   * The name of the author
   */
  authorName?: string;

  /**
   * The current branch of the project
   */
  currentBranch?: string;
}

/**
 * Core context class for release operations
 *
 * Manages release-specific configuration, environment variables,
 * workspace settings, and provides utilities for release operations.
 *
 * Features:
 * - Automatic environment detection
 * - Source branch management
 * - Workspace configuration
 * - Package.json access
 * - Template context generation
 * - Changeset CLI integration
 *
 * @example Basic initialization
 * ```typescript
 * const context = new ReleaseContext('my-package', {
 *   rootPath: '/path/to/project',
 *   sourceBranch: 'main'
 * });
 * ```
 *
 * @example Environment configuration
 * ```typescript
 * // With environment variables
 * process.env.FE_RELEASE_ENV = 'staging';
 * process.env.FE_RELEASE_BRANCH = 'develop';
 *
 * const context = new ReleaseContext('my-package', {});
 * // context.releaseEnv === 'staging'
 * // context.sourceBranch === 'develop'
 * ```
 */
export default class ReleaseContext extends ScriptContext<ReleaseContextConfig> {
  /**
   * Creates a new ReleaseContext instance
   *
   * Initializes the context with provided options and sets up
   * default values for required configuration:
   * - rootPath: Defaults to current working directory
   * - sourceBranch: Uses environment variables or default
   * - releaseEnv: Uses environment variables or 'development'
   *
   * Environment Variable Priority:
   * - sourceBranch: FE_RELEASE_BRANCH > FE_RELEASE_SOURCE_BRANCH > DEFAULT_SOURCE_BRANCH
   * - releaseEnv: FE_RELEASE_ENV > NODE_ENV > 'development'
   *
   * @param name - Unique identifier for this release context
   * @param options - Configuration options
   *
   * @example
   * ```typescript
   * const context = new ReleaseContext('web-app', {
   *   rootPath: '/projects/web-app',
   *   sourceBranch: 'main',
   *   releaseEnv: 'production'
   * });
   * ```
   */
  constructor(name: string, options: Partial<ReleaseContextOptions>) {
    super(name, options);

    if (!this.options.rootPath) {
      this.setOptions({ rootPath: process.cwd() });
    }

    if (!this.options.sourceBranch) {
      this.setOptions({
        sourceBranch:
          this.env.get('FE_RELEASE_BRANCH') ||
          this.env.get('FE_RELEASE_SOURCE_BRANCH') ||
          DEFAULT_SOURCE_BRANCH
      });
    }

    if (!this.options.releaseEnv) {
      this.setOptions({
        releaseEnv:
          this.env.get('FE_RELEASE_ENV') ||
          this.env.get('NODE_ENV') ||
          'development'
      });
    }
  }

  /**
   * Gets the root path of the project
   *
   * @returns Absolute path to project root
   *
   * @example
   * ```typescript
   * const root = context.rootPath;
   * // '/path/to/project'
   * ```
   */
  get rootPath(): string {
    return this.getOptions('rootPath');
  }

  /**
   * Gets the source branch for the release
   *
   * @returns Branch name to use as source
   *
   * @example
   * ```typescript
   * const branch = context.sourceBranch;
   * // 'main' or custom branch name
   * ```
   */
  get sourceBranch(): string {
    return this.getOptions('sourceBranch');
  }

  /**
   * Gets the release environment
   *
   * @returns Environment name (e.g., 'development', 'production')
   *
   * @example
   * ```typescript
   * const env = context.releaseEnv;
   * // 'development' or custom environment
   * ```
   */
  get releaseEnv(): string {
    return this.getOptions('releaseEnv');
  }

  /**
   * Gets all configured workspaces
   *
   * @returns Array of workspace configurations or undefined
   *
   * @example
   * ```typescript
   * const allWorkspaces = context.workspaces;
   * // [{ name: 'pkg-a', version: '1.0.0', ... }]
   * ```
   */
  get workspaces(): WorkspaceValue[] | undefined {
    return this.getOptions('workspaces.workspaces');
  }

  /**
   * Gets the current active workspace
   *
   * @returns Current workspace configuration or undefined
   *
   * @example
   * ```typescript
   * const current = context.workspace;
   * // { name: 'pkg-a', version: '1.0.0', ... }
   * ```
   */
  get workspace(): WorkspaceValue | undefined {
    return this.getOptions('workspaces.workspace');
  }

  /**
   * Sets the workspace configurations
   *
   * Updates the workspace list while preserving other workspace settings
   *
   * @param workspaces - Array of workspace configurations
   *
   * @example
   * ```typescript
   * context.setWorkspaces([{
   *   name: 'pkg-a',
   *   version: '1.0.0',
   *   path: 'packages/a'
   * }]);
   * ```
   */
  setWorkspaces(workspaces: WorkspaceValue[]): void {
    this.options.workspaces = {
      ...this.options.workspaces,
      workspaces
    };
  }

  /**
   * Gets package.json data for the current workspace
   *
   * Provides type-safe access to package.json fields with optional
   * path and default value support.
   *
   * @param key - Optional dot-notation path to specific field
   * @param defaultValue - Default value if field not found
   * @returns Package data of type T
   * @throws Error if package.json not found
   *
   * @example Basic usage
   * ```typescript
   * // Get entire package.json
   * const pkg = context.getPkg();
   *
   * // Get specific field
   * const version = context.getPkg<string>('version');
   *
   * // Get nested field with default
   * const script = context.getPkg<string>(
   *   'scripts.build',
   *   'echo "No build script"'
   * );
   * ```
   */
  getPkg<T>(key?: string, defaultValue?: T): T {
    const packageJson = this.workspace?.packageJson;

    if (!packageJson) {
      throw new Error('package.json is not found');
    }

    if (!key) {
      return packageJson as T;
    }

    return get(packageJson, key, defaultValue) as T;
  }

  /**
   * Generates template context for string interpolation
   *
   * Combines context options, workspace data, and specific paths
   * for use in template processing. Includes deprecated fields
   * for backward compatibility.
   *
   * @returns Combined template context
   *
   * @example
   * ```typescript
   * const context = releaseContext.getTemplateContext();
   * // {
   * //   publishPath: 'packages/my-pkg',
   * //   env: 'production',        // deprecated
   * //   branch: 'main',          // deprecated
   * //   releaseEnv: 'production', // use this instead
   * //   sourceBranch: 'main',    // use this instead
   * //   ...other options
   * // }
   * ```
   */
  getTemplateContext(): TemplateContext {
    return {
      ...this.getOptions(),
      ...this.workspace!,
      publishPath: this.workspace?.path || '',
      // deprecated
      env: this.releaseEnv,
      branch: this.sourceBranch
    };
  }

  /**
   * Executes changeset CLI commands
   *
   * Automatically detects and uses appropriate package manager
   * (pnpm or npx) to run changeset commands.
   *
   * @param name - Changeset command name
   * @param args - Optional command arguments
   * @returns Command output
   *
   * @example Version bump
   * ```typescript
   * // Bump version with snapshot
   * await context.runChangesetsCli('version', ['--snapshot', 'alpha']);
   *
   * // Create new changeset
   * await context.runChangesetsCli('add');
   *
   * // Status check
   * await context.runChangesetsCli('status');
   * ```
   */
  async runChangesetsCli(name: string, args?: string[]): Promise<string> {
    // is pnpm?
    let packageManager = 'pnpm';
    try {
      await this.shell.exec('pnpm -v', { dryRun: false });
    } catch {
      packageManager = 'npx';
    }

    return await this.shell.exec([
      packageManager,
      'changeset',
      name,
      ...(args ?? [])
    ]);
  }
}
