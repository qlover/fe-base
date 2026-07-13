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
import type { ReleaseGlobalConfig, TemplateContext } from '../type';
import merge from 'lodash/merge';
import { releaseJson } from '../defaults';
import { randomUUID } from 'node:crypto';
import type { RenderFn } from '@qlover/scripts-context';
import {
  ScriptContext,
  type ScriptContextInterface,
  type ScriptSharedInterface,
  TemplateEngine
} from '@qlover/scripts-context';
import type { PluginClass, PluginTuple } from '../utils/tuple';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';

export interface ReleaseContextOptions extends ScriptContextInterface<ReleaseContextConfig> {}

export interface ReleaseContextConfig
  extends ReleaseGlobalConfig, ScriptSharedInterface {
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

  /**
   * Unique identifier for the current release run
   *
   * @private
   */
  releaseId?: string;
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
  protected templateEngine: TemplateEngine = new TemplateEngine();

  protected compileMap: Map<string, RenderFn> = new Map();

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
   * - sourceBranch: FE_RELEASE_BRANCH > FE_RELEASE_SOURCE_BRANCH > release.json
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
    const releaseId = randomUUID().replace(/-/g, '').slice(0, 16);

    // Fill missing values from built-in release.json defaults.
    // User fe-config and constructor options already take precedence via super().
    const base: ReleaseContextConfig = merge({}, releaseJson, this.parameters);

    // Values that must not be overridden externally (releaseId).
    base.releaseId = releaseId;

    base.sourceBranch =
      this.env.get('FE_RELEASE_BRANCH') ||
      this.env.get('FE_RELEASE_SOURCE_BRANCH') ||
      base.sourceBranch;

    base.releaseEnv =
      this.env.get('FE_RELEASE_ENV') ||
      this.env.get('NODE_ENV') ||
      base.releaseEnv;

    this.setParameters(base);
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
  public get rootPath(): string {
    return this.parameters.rootPath!;
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
  public get sourceBranch(): string {
    return this.parameters.sourceBranch!;
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
  public get releaseEnv(): string {
    return this.parameters.releaseEnv!;
  }

  /**
   * Gets the unique identifier for the current release run
   */
  public get releaseId(): string {
    return this.parameters.releaseId!;
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
  public get workspaces(): WorkspaceInterface[] | undefined {
    return this.parameters.workspaces?.workspaces;
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
   *   path: 'packages/a',
   *   lastTag: 'pkg-aV1.0.0'
   * }]);
   * ```
   */
  public setWorkspaces(workspaces: WorkspaceInterface[]): void {
    this.options.workspaces = {
      ...this.options.workspaces,
      workspaces
    };
  }

  /**
   * @deprecated use `getParameters` or use `context.parameters`(type safe)
   * @param key
   * @param defaultValue
   */
  public getOptions<T = unknown>(
    key?: keyof ReleaseContextConfig | (keyof ReleaseContextConfig)[],
    defaultValue?: T
  ): T {
    return this.getParameters(key, defaultValue);
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
  public getTemplateContext(): TemplateContext {
    return {
      // TODO:
      ...this.getParameters(),
      // ...this.workspace!,
      // publishPath: this.workspace?.path || '',
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
  public async runChangesetsCli(
    name: string,
    args?: string[]
  ): Promise<string> {
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

  /**
   * Gets the workspaces of the project
   *
   * If no workspaces are found, throws an error.
   *
   * @throws Error if no workspaces are found
   * @returns The workspaces of the project
   *
   * @example
   * ```typescript
   * const workspaces = context.requireWorkspaces();
   * // [{ name: 'pkg-a', version: '1.0.0', ... }]
   * ```
   */
  public requireWorkspaces(): WorkspaceInterface[] {
    const workspaces = this.workspaces;
    if (!workspaces || workspaces.length === 0) {
      throw new Error(
        'No workspaces found. Run the workspaces plugin first or set the workspaces manually.'
      );
    }

    return workspaces;
  }

  /**
   * Format a template with the given data
   *
   * The template will be compiled only once and cached for future use.
   *
   * @param template - The template to format
   * @param data - The data to format the template with
   * @returns The formatted template
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public format(template: string, data: Record<string, any>): string {
    let renderFn = this.compileMap.get(template);

    if (!renderFn) {
      renderFn = this.templateEngine.compile(template);
      this.compileMap.set(template, renderFn);
    }

    return renderFn(data);
  }

  public getTemplateEngine(): TemplateEngine {
    return this.templateEngine;
  }
}
