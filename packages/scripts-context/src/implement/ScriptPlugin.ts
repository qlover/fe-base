import type { LoggerInterface } from '@qlover/logger';
import type { ScriptContext } from './ScriptContext';
import type { ShellInterface } from '../interface/ShellInterface';
import type { ExecutorContext, ExecutorPlugin } from '@qlover/fe-corekit';
import merge from 'lodash/merge';

/**
 * Configuration for a single execution step
 *
 * Represents a discrete task within a script plugin with:
 * - Human-readable label for logging
 * - Optional enable/disable control
 * - Async task function to execute
 *
 * @example
 * ```typescript
 * const step: StepOption<string> = {
 *   label: 'Building project',
 *   enabled: true,
 *   task: async () => {
 *     // Build logic here
 *     return 'build completed';
 *   }
 * };
 * ```
 */
export type StepOption<T> = {
  /** Human-readable label for the step, used in logging */
  label: string;
  /** Whether the step should be executed (default: true) */
  enabled?: boolean;
  /** Async function that performs the actual work */
  task: () => Promise<T>;
};

/**
 * Base properties for script plugin configuration
 *
 * Provides common configuration options that all script plugins can use:
 * - Lifecycle execution control
 * - Step skipping capabilities
 * - Plugin-specific overrides
 *
 * @example
 * ```typescript
 * const props: ScriptPluginProps = {
 *   skip: false // Enable all lifecycle methods
 * };
 *
 * const props: ScriptPluginProps = {
 *   skip: 'onBefore' // Skip only the onBefore lifecycle
 * };
 * ```
 */
export interface ScriptPluginProps {
  /**
   * Controls whether to skip lifecycle execution
   *
   * Skip Options:
   * - `true` - Skip all lifecycle methods (onBefore, onExec, onSuccess, onError)
   * - `string` - Skip specific lifecycle method ('onBefore', 'onExec', 'onSuccess', 'onError')
   * - `false` or `undefined` - Execute all lifecycle methods (default)
   *
   * @example
   * ```typescript
   * // Skip all lifecycle methods
   * { skip: true }
   *
   * // Skip only onBefore
   * { skip: 'onBefore' }
   *
   * // Skip only onError
   * { skip: 'onError' }
   * ```
   */
  skip?: boolean | string;
}

/**
 * Abstract base class for script plugins that provides common functionality
 *
 * Core Features:
 * - Lifecycle management (onBefore, onExec, onSuccess, onError)
 * - Configuration management with priority merging
 * - Step execution with logging
 * - Plugin enable/disable control
 * - Shell and logger access
 *
 * Design Considerations:
 * - Uses generic types for type-safe context and properties
 * - Implements ExecutorPlugin interface for integration
 * - Supports configuration from multiple sources with priority
 * - Provides consistent logging and error handling
 *
 * Configuration Priority (highest to lowest):
 * 1. Constructor props (runtime)
 * 2. Command line config (context.options[pluginName])
 * 3. File config (context.getOptions(pluginName))
 * 4. Default values
 *
 * @example Basic Plugin Implementation
 * ```typescript
 * class MyPlugin extends ScriptPlugin<MyContext, MyProps> {
 *   async onExec(context: ExecutorContext<MyContext>): Promise<void> {
 *     await this.step({
 *       label: 'Processing files',
 *       task: async () => {
 *         // Process files logic
 *         return 'processed';
 *       }
 *     });
 *   }
 * }
 * ```
 *
 * @example Plugin with Custom Configuration
 * ```typescript
 * interface MyPluginProps extends ScriptPluginProps {
 *   outputDir: string;
 *   verbose: boolean;
 * }
 *
 * class BuildPlugin extends ScriptPlugin<BuildContext, MyPluginProps> {
 *   async onExec(context: ExecutorContext<BuildContext>): Promise<void> {
 *     const outputDir = this.getConfig('outputDir', './dist');
 *     const verbose = this.getConfig('verbose', false);
 *
 *     if (verbose) {
 *       this.logger.info(`Building to ${outputDir}`);
 *     }
 *   }
 * }
 * ```
 */
export abstract class ScriptPlugin<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Context extends ScriptContext<any>,
  Props extends ScriptPluginProps = ScriptPluginProps
> implements ExecutorPlugin<Context>
{
  /** Ensures only one instance of this plugin can be registered */
  public readonly onlyOne = true;

  /**
   * Creates a new script plugin instance
   *
   * Initialization Process:
   * 1. Stores context and plugin name references
   * 2. Merges configuration from multiple sources
   * 3. Sets up initial configuration state
   *
   * @param context - Script context providing environment and configuration
   * @param pluginName - Unique identifier for this plugin (used for config namespace)
   * @param props - Optional runtime configuration overrides
   *
   * @example
   * ```typescript
   * // Basic initialization
   * const plugin = new MyPlugin(context, 'my-plugin');
   *
   * // With runtime configuration
   * const plugin = new MyPlugin(context, 'build-plugin', {
   *   outputDir: './custom-dist',
   *   skip: false
   * });
   * ```
   */
  constructor(
    protected context: Context,
    readonly pluginName: string,
    protected props: Props = {} as Props
  ) {
    this.setConfig(this.getInitialProps(props));
  }

  /**
   * Merges configuration from multiple sources with proper priority
   *
   * Configuration Sources (priority order):
   * 1. Constructor props (highest priority)
   * 2. Command line config (context.options[pluginName])
   * 3. File config (context.getOptions(pluginName))
   * 4. Empty object (fallback)
   *
   * @param props - Runtime configuration overrides
   * @returns Merged configuration object
   *
   * @example
   * ```typescript
   * // Get merged config from all sources
   * const config = this.getInitialProps({
   *   outputDir: './runtime-dist' // This will override file config
   * });
   * ```
   */
  public getInitialProps(props?: Props): Props {
    if (typeof this.context.options !== 'object') {
      return {} as Props;
    }

    // command line config, first priority
    const pluginConfig = this.context.options[this.pluginName];

    const fileConfig = this.context.getOptions(this.pluginName);

    // Determine base config: command line config takes priority over file config
    const baseConfig = pluginConfig || fileConfig;

    // If props are provided, merge them with base config
    // If no props provided, return base config or empty object
    return props ? merge({}, baseConfig, props) : baseConfig || ({} as Props);
  }

  /**
   * Logger instance for structured logging
   *
   * Provides access to the context logger with proper type casting
   * for integration with the logging system.
   *
   * @returns LoggerInterface instance for logging operations
   *
   * @example
   * ```typescript
   * this.logger.info('Starting build process');
   * this.logger.error('Build failed', error);
   * this.logger.debug('Debug information', { config: this.options });
   * ```
   */
  public get logger(): LoggerInterface {
    return this.context.logger as unknown as LoggerInterface;
  }

  /**
   * Shell interface for command execution
   *
   * Provides access to shell operations for executing commands,
   * managing processes, and file system operations.
   *
   * @returns ShellInterface instance for shell operations
   *
   * @example
   * ```typescript
   * // Execute a command
   * await this.shell.exec('npm run build');
   *
   * // Check if file exists
   * const exists = await this.shell.exists('./package.json');
   *
   * // Read file content
   * const content = await this.shell.readFile('./config.json');
   * ```
   */
  public get shell(): ShellInterface {
    return this.context.shell;
  }

  /**
   * Current plugin configuration options
   *
   * Retrieves the merged configuration for this plugin from the context.
   * This includes all configuration sources merged with proper priority.
   *
   * @returns Current plugin configuration object
   *
   * @example
   * ```typescript
   * // Access configuration
   * const { outputDir, verbose } = this.options;
   *
   * // Use in conditional logic
   * if (this.options.skip) {
   *   this.logger.info('Plugin execution skipped');
   *   return;
   * }
   * ```
   */
  public get options(): Props {
    return this.context.getOptions(this.pluginName, {} as Props);
  }

  /**
   * Determines whether a lifecycle method should be executed
   *
   * Skip Logic:
   * - Returns `false` if skip is `true` (skip all)
   * - Returns `false` if skip matches the lifecycle name (skip specific)
   * - Returns `true` otherwise (execute normally)
   *
   * @override
   * @param _name - Name of the lifecycle method being checked
   * @param _context - Executor context (unused in base implementation)
   * @returns Whether the lifecycle method should be executed
   *
   * @example
   * ```typescript
   * // Skip all lifecycle methods
   * const plugin = new MyPlugin(context, 'my-plugin', { skip: true });
   * plugin.enabled('onBefore', context); // Returns false
   *
   * // Skip specific lifecycle method
   * const plugin = new MyPlugin(context, 'my-plugin', { skip: 'onBefore' });
   * plugin.enabled('onBefore', context); // Returns false
   * plugin.enabled('onExec', context);   // Returns true
   * ```
   */
  public enabled(_name: string, _context: ExecutorContext<Context>): boolean {
    const skip = this.getConfig('skip');

    // if skip is true, then return false
    if (skip === true) {
      return false;
    }

    // if skip is a string, and the name is the same as the skip, then return false
    if (typeof skip === 'string' && _name === skip) {
      return false;
    }

    return true;
  }

  /**
   * Retrieves configuration values with nested path support
   *
   * Features:
   * - Safe nested object access using lodash get
   * - Automatic plugin namespace prefixing
   * - Default value support for missing keys
   * - Type-safe return values
   *
   * @param keys - Optional path to specific configuration (string or array)
   * @param defaultValue - Default value if configuration not found
   * @returns Configuration value or default, full config if no keys provided
   *
   * @example
   * ```typescript
   * // Get full plugin configuration
   * const config = this.getConfig();
   *
   * // Get specific configuration value
   * const outputDir = this.getConfig('outputDir', './dist');
   *
   * // Get nested configuration
   * const buildMode = this.getConfig(['build', 'mode'], 'development');
   *
   * // Get with type safety
   * const port = this.getConfig<number>('port', 3000);
   *
   * // Get array configuration
   * const plugins = this.getConfig<string[]>('plugins', []);
   * ```
   */
  public getConfig<T>(keys?: string | string[], defaultValue?: T): T {
    if (!keys) {
      return this.context.getOptions(this.pluginName, defaultValue);
    }

    return this.context.getOptions(
      [this.pluginName, ...(Array.isArray(keys) ? keys : [keys])],
      defaultValue
    );
  }

  /**
   * Updates plugin configuration with deep merging
   *
   * Merging Strategy:
   * - Uses lodash merge for deep object merging
   * - Preserves existing configuration not specified in update
   * - Updates configuration in the plugin's namespace
   * - Maintains type safety through generic constraints
   *
   * @param config - Partial configuration to merge with current settings
   *
   * @example
   * ```typescript
   * // Update single configuration
   * this.setConfig({ outputDir: '/new/path' });
   *
   * // Update multiple configurations
   * this.setConfig({
   *   verbose: true,
   *   buildMode: 'production'
   * });
   *
   * // Update nested configuration
   * this.setConfig({
   *   build: {
   *     minify: true,
   *     sourcemap: false
   *   }
   * });
   * ```
   */
  public setConfig(config: Partial<Props>): void {
    this.context.setOptions({
      [this.pluginName]: config
    });
  }

  /**
   * Lifecycle method called before script execution
   *
   * Override this method to perform setup tasks such as:
   * - Environment validation
   * - Configuration verification
   * - Resource preparation
   * - Pre-execution checks
   *
   * @override
   * @param _context - Executor context containing execution state
   *
   * @example
   * ```typescript
   * async onBefore(context: ExecutorContext<MyContext>): Promise<void> {
   *   // Validate required environment variables
   *   const apiKey = this.context.getEnv('API_KEY');
   *   if (!apiKey) {
   *     throw new Error('API_KEY environment variable is required');
   *   }
   *
   *   // Check if output directory exists
   *   const outputDir = this.getConfig('outputDir', './dist');
   *   if (!(await this.shell.exists(outputDir))) {
   *     await this.shell.mkdir(outputDir);
   *   }
   * }
   * ```
   */
  public onBefore?(_context: ExecutorContext<Context>): void | Promise<void> {}

  /**
   * Lifecycle method called during script execution
   *
   * Override this method to implement the main plugin logic:
   * - Core functionality execution
   * - Business logic implementation
   * - Task orchestration
   * - Process management
   *
   * @override
   * @param _context - Executor context containing execution state
   *
   * @example
   * ```typescript
   * async onExec(context: ExecutorContext<MyContext>): Promise<void> {
   *   await this.step({
   *     label: 'Building project',
   *     task: async () => {
   *       await this.shell.exec('npm run build');
   *       return 'build completed';
   *     }
   *   });
   *
   *   await this.step({
   *     label: 'Running tests',
   *     task: async () => {
   *       await this.shell.exec('npm test');
   *       return 'tests passed';
   *     }
   *   });
   * }
   * ```
   */
  public onExec?(_context: ExecutorContext<Context>): void | Promise<void> {}

  /**
   * Lifecycle method called after successful script execution
   *
   * Override this method to perform cleanup tasks such as:
   * - Resource cleanup
   * - Success notifications
   * - Result processing
   * - Post-execution reporting
   *
   * @override
   * @param _context - Executor context containing execution state
   *
   * @example
   * ```typescript
   * async onSuccess(context: ExecutorContext<MyContext>): Promise<void> {
   *   // Send success notification
   *   await this.sendNotification('Build completed successfully');
   *
   *   // Generate success report
   *   await this.generateReport({
   *     status: 'success',
   *     timestamp: new Date(),
   *     duration: context.duration
   *   });
   *
   *   // Clean up temporary files
   *   await this.shell.rmdir('./temp');
   * }
   * ```
   */
  public onSuccess?(_context: ExecutorContext<Context>): void | Promise<void> {}

  /**
   * Lifecycle method called when script execution fails
   *
   * Override this method to handle errors such as:
   * - Error logging and reporting
   * - Resource cleanup on failure
   * - Error notifications
   * - Failure recovery attempts
   *
   * @override
   * @param _context - Executor context containing execution state
   *
   * @example
   * ```typescript
   * async onError(context: ExecutorContext<MyContext>): Promise<void> {
   *   // Log detailed error information
   *   this.logger.error('Script execution failed', {
   *     error: context.error,
   *     duration: context.duration,
   *     config: this.options
   *   });
   *
   *   // Send error notification
   *   await this.sendNotification('Build failed', {
   *     error: context.error.message
   *   });
   *
   *   // Clean up partial results
   *   await this.shell.rmdir('./partial-build');
   * }
   * ```
   */
  public onError?(_context: ExecutorContext<Context>): void | Promise<void> {}

  /**
   * Executes a step with structured logging and error handling
   *
   * Features:
   * - Automatic step labeling in logs
   * - Structured success/failure logging
   * - Error propagation with context
   * - Visual separation in log output
   *
   * Step Execution Flow:
   * 1. Log step start with label
   * 2. Execute task function
   * 3. Log success or error
   * 4. Return task result or throw error
   *
   * @param options - Step configuration object
   * @param {string} options.label - Human-readable label for the step
   * @param {() => Promise<T>} options.task - Async function that performs the step work
   * @param {boolean} [options.enabled] - Whether the step should be executed (default: true)
   * @returns The result of the task execution
   *
   * @throws {Error} When the task function throws an error
   *
   * @example
   * ```typescript
   * // Basic step execution
   * const result = await this.step({
   *   label: 'Installing dependencies',
   *   task: async () => {
   *     await this.shell.exec('npm install');
   *     return 'dependencies installed';
   *   }
   * });
   *
   * // Step with conditional logic
   * await this.step({
   *   label: 'Running tests',
   *   enabled: this.getConfig('runTests', true),
   *   task: async () => {
   *     await this.shell.exec('npm test');
   *     return 'tests passed';
   *   }
   * });
   *
   * // Step with complex logic
   * await this.step({
   *   label: 'Building project',
   *   task: async () => {
   *     const buildMode = this.getConfig('buildMode', 'development');
   *     const command = `npm run build:${buildMode}`;
   *     await this.shell.exec(command);
   *     return {
   *       mode: buildMode,
   *       outputDir: this.getConfig('outputDir', './dist')
   *     };
   *   }
   * });
   * ```
   */
  public async step<T>(options: StepOption<T>): Promise<T> {
    this.logger.log();
    this.logger.info(options.label);
    this.logger.log();

    try {
      const res = await options.task();
      this.logger.info(`${options.label} - success`);
      return res;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
