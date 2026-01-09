/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @module ReleaseTask
 * @description Task orchestration for release process
 *
 * This module provides the core task orchestration for the release process,
 * managing plugin loading, execution order, and context handling. It serves
 * as the main entry point for executing release operations.
 *
 * Core Features:
 * - Plugin management and execution
 * - Release context initialization
 * - Task execution control
 * - Environment-based control
 *
 * Default Plugins:
 * - Workspaces: Monorepo workspace management
 * - Changelog: Version and changelog management
 * - GithubPR: Pull request creation and management
 *
 * @example Basic usage
 * ```typescript
 * // Initialize and execute
 * const task = new ReleaseTask({
 *   rootPath: '/path/to/project',
 *   sourceBranch: 'main'
 * });
 *
 * await task.exec();
 * ```
 *
 * @example Custom plugins
 * ```typescript
 * import { tuple } from '@qlover/fe-release';
 *
 * // Add custom plugin
 * class CustomPlugin extends ScriptPlugin {
 *   async onExec() {
 *     // Custom release logic
 *   }
 * }
 *
 * const task = new ReleaseTask({}, new LifecycleExecutor<ReleaseContext>(), [
 *   tuple(CustomPlugin, { option: 'value' })
 * ]);
 *
 * await task.exec();
 * ```
 *
 * @example Environment control
 * ```typescript
 * // Skip release
 * process.env.FE_RELEASE = 'false';
 *
 * const task = new ReleaseTask();
 * try {
 *   await task.exec();
 * } catch (e) {
 *   // Handle "Skip Release" error
 * }
 * ```
 */

import type {
  ScriptContext,
  ScriptPlugin,
  ScriptPluginProps
} from '@qlover/scripts-context';
import { tuple, type PluginClass, type PluginTuple } from '../utils/tuple';
import { LifecycleExecutor } from '@qlover/fe-corekit';
import ReleaseContext, { ReleaseContextOptions } from './ReleaseContext';
import GithubPR from '../plugins/githubPR/GithubPR';
import Workspaces from '../plugins/workspaces/Workspaces';
import { loaderPluginsFromPluginTuples } from '../utils/loader';
import Changelog from '../plugins/Changelog';

/**
 * Default plugin configuration tuples
 *
 * Defines the core plugins and their default configurations:
 * - Workspaces: For monorepo management
 * - Changelog: For version and changelog handling
 * - GithubPR: For pull request automation
 */
const innerTuples: PluginTuple<PluginClass>[] = [
  tuple(Workspaces),
  tuple(Changelog, {}),
  tuple(GithubPR, {})
];

/**
 * Default name for the release task context
 */
const defaultName = 'release';

/**
 * Core task class for managing release operations
 *
 * Handles plugin orchestration, task execution, and context management
 * for the release process. Supports both built-in and custom plugins.
 *
 * Features:
 * - Plugin lifecycle management
 * - Task execution control
 * - Context initialization and access
 * - Environment-based control
 *
 * @example Basic initialization
 * ```typescript
 * const task = new ReleaseTask({
 *   rootPath: '/path/to/project'
 * });
 * ```
 *
 * @example Custom executor
 * ```typescript
 * const executor = new LifecycleExecutor<ReleaseContext>({
 *   onError: (err) => console.error('Release failed:', err)
 * });
 *
 * const task = new ReleaseTask({}, executor);
 * ```
 *
 * @example Custom plugins
 * ```typescript
 * const task = new ReleaseTask(
 *   {}, // options
 *   new LifecycleExecutor<ReleaseContext>(),
 *   [
 *     tuple(CustomPlugin, { config: 'value' }),
 *     ...innerTuples // include default plugins
 *   ]
 * );
 * ```
 */
export default class ReleaseTask {
  /**
   * Release context instance
   * @protected
   */
  protected context: ReleaseContext;

  /**
   * Creates a new ReleaseTask instance
   *
   * Initializes the release context and sets up plugin configuration.
   * Supports custom executors and plugin configurations.
   *
   * @param options - Release context configuration
   * @param executor - Custom async executor (optional)
   * @param defaultTuples - Plugin configuration tuples (optional)
   *
   * @example
   * ```typescript
   * // Basic initialization
   * const task = new ReleaseTask({
   *   rootPath: '/path/to/project',
   *   sourceBranch: 'main'
   * });
   *
   * // With custom executor and plugins
   * const task = new ReleaseTask(
   *   { rootPath: '/path/to/project' },
   *   new LifecycleExecutor<ReleaseContext>(),
   *   [tuple(CustomPlugin, { option: 'value' })]
   * );
   * ```
   */
  constructor(
    options: Partial<ReleaseContextOptions> = {},
    private executor: LifecycleExecutor<ReleaseContext> = new LifecycleExecutor<ReleaseContext>(),
    private defaultTuples: PluginTuple<PluginClass>[] = innerTuples
  ) {
    this.context = new ReleaseContext(defaultName, options);
  }

  /**
   * Gets the current release context
   *
   * @returns Release context instance
   *
   * @example
   * ```typescript
   * const task = new ReleaseTask();
   * const context = task.getContext();
   *
   * console.log(context.releaseEnv);
   * console.log(context.sourceBranch);
   * ```
   */
  public getContext(): ReleaseContext {
    return this.context;
  }

  /**
   * Loads and configures plugins for the release task
   *
   * Combines default and external plugins, initializes them with
   * the current context, and configures special cases like the
   * Workspaces plugin.
   *
   * Plugin Loading Process:
   * 1. Merge default and external plugins
   * 2. Initialize plugins with context
   * 3. Configure special plugins
   * 4. Add plugins to executor
   *
   * @param externalTuples - Additional plugin configurations
   * @returns Array of initialized plugins
   *
   * @example Basic usage
   * ```typescript
   * const task = new ReleaseTask();
   * const plugins = await task.usePlugins();
   * ```
   *
   * @example Custom plugins
   * ```typescript
   * const task = new ReleaseTask();
   * const plugins = await task.usePlugins([
   *   tuple(CustomPlugin, { option: 'value' })
   * ]);
   * ```
   */
  public async usePlugins(
    externalTuples?: PluginTuple<PluginClass>[]
  ): Promise<ScriptPlugin<ScriptContext<any>, ScriptPluginProps>[]> {
    externalTuples = externalTuples || this.context.options.plugins || [];

    const plugins = await loaderPluginsFromPluginTuples(this.context, [
      ...this.defaultTuples,
      ...externalTuples
    ]);

    plugins.forEach((plugin) => {
      // set executor to workspaces plugin
      if (plugin instanceof Workspaces) {
        plugin.setReleaseTask(this);
      }

      this.executor.use(plugin);
    });

    return plugins;
  }

  /**
   * Executes the release task
   *
   * Internal method that runs the task through the executor.
   * Preserves the context through the execution chain.
   *
   * @returns Execution result
   * @internal
   */
  public async run(): Promise<unknown> {
    return this.executor.exec(this.context, (context) =>
      Promise.resolve(context)
    );
  }

  /**
   * Main entry point for executing the release task
   *
   * Checks environment conditions, loads plugins, and executes
   * the release process. Supports additional plugin configuration
   * at execution time.
   *
   * Environment Control:
   * - Checks FE_RELEASE environment variable
   * - Skips release if FE_RELEASE=false
   *
   * @param externalTuples - Additional plugin configurations
   * @returns Execution result
   * @throws Error if release is skipped via environment variable
   *
   * @example Basic execution
   * ```typescript
   * const task = new ReleaseTask();
   * await task.exec();
   * ```
   *
   * @example With additional plugins
   * ```typescript
   * const task = new ReleaseTask();
   * await task.exec([
   *   tuple(CustomPlugin, { option: 'value' })
   * ]);
   * ```
   *
   * @example Environment control
   * ```typescript
   * // Skip release
   * process.env.FE_RELEASE = 'false';
   *
   * const task = new ReleaseTask();
   * try {
   *   await task.exec();
   * } catch (e) {
   *   if (e.message === 'Skip Release') {
   *     console.log('Release skipped via environment variable');
   *   }
   * }
   * ```
   */
  public async exec(
    externalTuples?: PluginTuple<PluginClass>[]
  ): Promise<unknown> {
    if (this.context.env.get('FE_RELEASE') === 'false') {
      throw new Error('Skip Release');
    }

    // load plugins
    await this.usePlugins(externalTuples);

    return this.run();
  }
}
