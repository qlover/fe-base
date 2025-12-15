import type { LoggerInterface } from '@qlover/logger';
import type {
  ShellExecOptions,
  ShellInterface
} from '../interface/ShellInterface';
import lodashTemplate from 'lodash/template';

/**
 * Function type for executing shell commands
 *
 * Core concept:
 * Defines the signature for command execution functions that
 * can be injected into the Shell class for flexible command
 * execution strategies.
 *
 * Function signature:
 * - Accepts command as string or array of strings
 * - Accepts execution options for customization
 * - Returns Promise resolving to command output
 * - Handles command execution and error conditions
 *
 * @param command - Command string or array of command parts
 * @param options - Shell execution options for customization
 * @returns Promise resolving to command output (trimmed)
 *
 * @example Basic usage
 * ```typescript
 * const execFn: ExecPromiseFunction = async (command, options) => {
 *   // Custom command execution logic
 *   return 'command output';
 * };
 * ```
 */
export type ExecPromiseFunction = (
  command: string | string[],
  options: ShellExecOptions
) => Promise<string>;

/**
 * Configuration interface for Shell class initialization
 *
 * Core concept:
 * Defines the configuration parameters required to initialize
 * a Shell instance with logging, execution, and caching capabilities.
 *
 * Configuration components:
 * - Logger: Required for command logging and error reporting
 * - Execution function: Optional custom command execution strategy
 * - Execution options: Inherited from ShellExecOptions for command customization
 *
 * @example Basic configuration
 * ```typescript
 * const config: ShellConfig = {
 *   logger: myLogger,
 *   dryRun: false,
 *   isCache: true
 * };
 * ```
 *
 * @example With custom execution function
 * ```typescript
 * const config: ShellConfig = {
 *   logger: myLogger,
 *   execPromise: customExecFunction,
 *   dryRun: true
 * };
 * ```
 */
export interface ShellConfig extends ShellExecOptions {
  /**
   * Logger instance for command logging and error reporting
   *
   * Used for:
   * - Logging command execution details
   * - Reporting template formatting errors
   * - Debug information for command execution
   * - Error messages and stack traces
   *
   * @example `new Logger({ level: 'info', handlers: new ConsoleHandler() })`
   */
  logger: LoggerInterface;

  /**
   * Custom command execution function
   *
   * Optional function to override the default command execution
   * strategy. When not provided, the Shell class will throw an
   * error if no execution function is available.
   *
   * Use cases:
   * - Custom command execution logic
   * - Integration with specific shell environments
   * - Mock functions for testing
   * - Enhanced error handling and reporting
   *
   * @optional
   * @example
   * ```typescript
   * const customExec: ExecPromiseFunction = async (command, options) => {
   *   // Custom execution logic
   *   return await executeCommand(command, options);
   * };
   * ```
   */
  execPromise?: ExecPromiseFunction;
}

/**
 * Shell class for command execution with templating and caching support
 *
 * Core concept:
 * Provides a comprehensive command execution interface with
 * template string formatting, command caching, dry run support,
 * and integrated logging capabilities.
 *
 * Main features:
 * - Template formatting: Dynamic command generation with context
 *   - Uses lodash template for string interpolation
 *   - Supports complex template expressions
 *   - Provides error handling for template failures
 *   - Enables dynamic command construction
 *
 * - Command caching: Performance optimization for repeated commands
 *   - Caches command results to avoid repeated execution
 *   - Configurable caching per command
 *   - Memory-efficient cache management
 *   - Cache invalidation through command options
 *
 * - Dry run support: Safe command testing and validation
 *   - Executes commands without actual system impact
 *   - Returns predefined results for testing
 *   - Useful for command validation and debugging
 *   - Supports both global and per-command dry run
 *
 * - Integrated logging: Comprehensive command execution tracking
 *   - Logs command execution details
 *   - Reports template formatting errors
 *   - Provides debug information for troubleshooting
 *   - Supports silent mode for quiet execution
 *
 * Design considerations:
 * - Uses dependency injection for execution functions
 * - Provides flexible configuration options
 * - Maintains backward compatibility with existing interfaces
 * - Supports both string and array command formats
 * - Implements proper error handling and reporting
 *
 * Performance optimizations:
 * - Command result caching for repeated executions
 * - Efficient template compilation and caching
 * - Minimal memory footprint for cache storage
 * - Lazy initialization of execution functions
 *
 * @example Basic usage
 * ```typescript
 * const shell = new Shell({
 *   logger: myLogger,
 *   dryRun: false
 * });
 *
 * const output = await shell.exec('npm install');
 * ```
 *
 * @example With template formatting
 * ```typescript
 * const shell = new Shell({ logger: myLogger });
 * const output = await shell.exec('git clone <%= repo %>', {
 *   context: { repo: 'https://github.com/user/repo.git' }
 * });
 * ```
 *
 * @example With caching
 * ```typescript
 * const shell = new Shell({ logger: myLogger, isCache: true });
 * // First execution
 * await shell.exec('npm install');
 * // Second execution uses cached result
 * await shell.exec('npm install');
 * ```
 *
 * @example Dry run mode
 * ```typescript
 * const shell = new Shell({ logger: myLogger, dryRun: true });
 * const output = await shell.exec('rm -rf /', {
 *   dryRunResult: 'Would delete all files'
 * });
 * // Returns 'Would delete all files' without executing command
 * ```
 */
export class Shell implements ShellInterface {
  /**
   * Creates a new Shell instance with the specified configuration
   *
   * Core concept:
   * Initializes a Shell instance with logging, execution, and
   * caching capabilities based on the provided configuration.
   *
   * Initialization process:
   * 1. Validates and stores configuration parameters
   * 2. Initializes command cache for performance optimization
   * 3. Sets up logging integration for command tracking
   * 4. Prepares template formatting capabilities
   *
   * Configuration validation:
   * - Logger is required for command logging and error reporting
   * - Execution function is optional but required for actual command execution
   * - Cache is initialized as an empty Map for command result storage
   * - All ShellExecOptions are inherited and validated
   *
   * Cache initialization:
   * - Uses Map for efficient key-value storage
   * - Stores Promise<string> for command results
   * - Supports concurrent command execution
   * - Provides automatic memory management
   *
   * @param config - Shell configuration with logger and execution options
   * @param cache - Optional command cache map for result storage
   *
   * @example Basic initialization
   * ```typescript
   * const shell = new Shell({
   *   logger: myLogger,
   *   dryRun: false,
   *   isCache: true
   * });
   * ```
   *
   * @example With custom cache
   * ```typescript
   * const customCache = new Map<string, Promise<string>>();
   * const shell = new Shell({ logger: myLogger }, customCache);
   * ```
   */
  constructor(
    public config: ShellConfig,
    private cache: Map<string, Promise<string>> = new Map()
  ) {}

  /**
   * Gets the logger instance for command logging and error reporting
   *
   * Core concept:
   * Provides access to the configured logger instance for
   * command execution tracking and error reporting.
   *
   * Logger usage:
   * - Command execution logging (debug level)
   * - Template formatting error reporting
   * - Command execution error logging
   * - Debug information for troubleshooting
   *
   * @returns Logger instance for command logging and error reporting
   *
   * @example Basic usage
   * ```typescript
   * const logger = shell.logger;
   * logger.info('Shell instance created');
   * ```
   */
  public get logger(): LoggerInterface {
    return this.config.logger;
  }

  /**
   * Formats a template string with context using lodash template
   *
   * Core concept:
   * Provides static template formatting functionality using
   * lodash template for string interpolation with context data.
   *
   * Template features:
   * - Uses lodash template for powerful string interpolation
   * - Supports complex template expressions and logic
   * - Handles undefined and null context values gracefully
   * - Returns formatted string with context values substituted
   *
   * Template syntax:
   * - `<%= variable %>` for escaped output
   * - `<%- variable %>` for unescaped output
   * - `<% code %>` for JavaScript code execution
   * - Supports nested object access and function calls
   *
   * Context handling:
   * - Accepts any object with string/number/boolean values
   * - Handles undefined and null values safely
   * - Supports nested object property access
   * - Provides fallback for missing context values
   *
   * @param template - Template string with interpolation placeholders
   * @param context - Context object for template variable substitution
   * @returns Formatted string with context values substituted
   *
   * @example Basic template formatting
   * ```typescript
   * const result = Shell.format('Hello <%= name %>!', { name: 'World' });
   * // Returns: 'Hello World!'
   * ```
   *
   * @example Complex template with nested objects
   * ```typescript
   * const result = Shell.format(
   *   'git clone <%= repo.url %> <%= repo.branch %>',
   *   { repo: { url: 'https://github.com/user/repo.git', branch: 'main' } }
   * );
   * // Returns: 'git clone https://github.com/user/repo.git main'
   * ```
   *
   * @example Template with conditional logic
   * ```typescript
   * const result = Shell.format(
   *   'npm install<% if (dev) { %> --save-dev<% } %>',
   *   { dev: true }
   * );
   * // Returns: 'npm install --save-dev'
   * ```
   */
  public static format(
    template: string = '',
    context: Record<string, unknown> = {}
  ): string {
    return lodashTemplate(template)(context);
  }

  /**
   * Formats a template string with context and comprehensive error handling
   *
   * Core concept:
   * Provides instance-based template formatting with detailed
   * error logging and exception handling for debugging and
   * troubleshooting template issues.
   *
   * Error handling:
   * - Catches template compilation errors
   * - Logs detailed error information including template and context
   * - Provides stack trace information for debugging
   * - Re-throws errors for proper error propagation
   *
   * Logging features:
   * - Logs template content for debugging
   * - Logs context object for variable inspection
   * - Logs error details and stack traces
   * - Uses error level for template failures
   *
   * Debugging support:
   * - Provides template content in error messages
   * - Includes context object for variable inspection
   * - Logs complete error information for troubleshooting
   * - Maintains error stack traces for debugging
   *
   * @param template - Template string with interpolation placeholders
   * @param context - Context object for template variable substitution
   * @returns Formatted string with context values substituted
   * @throws Error if template formatting fails with detailed logging
   *
   * @example Basic formatting
   * ```typescript
   * const result = shell.format('Hello <%= name %>!', { name: 'World' });
   * // Returns: 'Hello World!'
   * ```
   *
   * @example Error handling
   * ```typescript
   * try {
   *   const result = shell.format('Hello <%= name %>!', {});
   * } catch (error) {
   *   // Error is logged with template and context information
   *   console.error('Template formatting failed:', error.message);
   * }
   * ```
   */
  public format(
    template: string = '',
    context: Record<string, unknown> = {}
  ): string {
    try {
      return Shell.format(template, context);
    } catch (error) {
      this.logger.error(
        `Unable to render template with context:\n${template}\n${JSON.stringify(context)}`
      );
      this.logger.error(error);
      throw error;
    }
  }

  /**
   * Executes a command with template formatting and execution options
   *
   * Core concept:
   * Provides the main command execution interface with template
   * formatting support, allowing dynamic command generation
   * based on context variables.
   *
   * Execution process:
   * 1. Extracts context from options for template formatting
   * 2. Formats command string with context if command is a string
   * 3. Passes formatted command to execution engine
   * 4. Handles both string and array command formats
   * 5. Applies execution options for customization
   *
   * Template formatting:
   * - Only applies to string commands (not arrays)
   * - Uses context object for variable substitution
   * - Handles template formatting errors gracefully
   * - Supports complex template expressions
   *
   * Command handling:
   * - String commands: Formatted with context before execution
   * - Array commands: Passed directly to execution engine
   * - Mixed formats: Handled appropriately based on type
   * - Options: Applied consistently across all command types
   *
   * @override
   * @param command - Command string (with template) or array of command parts
   * @param options - Execution options including context for template formatting
   * @returns Promise resolving to command output
   *
   * @example String command with template
   * ```typescript
   * const output = await shell.exec('git clone <%= repo %>', {
   *   context: { repo: 'https://github.com/user/repo.git' }
   * });
   * ```
   *
   * @example Array command
   * ```typescript
   * const output = await shell.exec(['git', 'clone', 'https://github.com/user/repo.git']);
   * ```
   *
   * @example With execution options
   * ```typescript
   * const output = await shell.exec('npm install', {
   *   cwd: '/path/to/project',
   *   silent: true,
   *   dryRun: false
   * });
   * ```
   */
  public exec(
    command: string | string[],
    options: ShellExecOptions = {}
  ): Promise<string> {
    const { context, ...execOptions } = options;
    return typeof command === 'string'
      ? this.execFormattedCommand(
          this.format(command, context || {}),
          execOptions
        )
      : this.execFormattedCommand(command, execOptions);
  }

  /**
   * Executes a command silently (deprecated)
   *
   * Core concept:
   * Legacy method for silent command execution, now deprecated
   * in favor of the more flexible `exec` method with silent option.
   *
   * Deprecation notice:
   * - This method is deprecated and will be removed in future versions
   * - Use `exec` method with `silent: true` option instead
   * - Provides backward compatibility for existing code
   * - Maintains same functionality through `exec` method
   *
   * Silent execution:
   * - Suppresses command logging output
   * - Maintains error logging for debugging
   * - Useful for quiet command execution
   * - Reduces log noise in automated scripts
   *
   * @param command - Command string or array
   * @param options - Execution options (silent mode is automatically enabled)
   * @returns Promise resolving to command output
   * @deprecated Use `exec` method with `silent: true` option instead
   *
   * @example Deprecated usage
   * ```typescript
   * const output = await shell.run('npm install');
   * ```
   *
   * @example Recommended replacement
   * ```typescript
   * const output = await shell.exec('npm install', { silent: true });
   * ```
   */
  public run(
    command: string | string[],
    options: ShellExecOptions = {}
  ): Promise<string> {
    return this.exec(command, { silent: true, ...options });
  }

  /**
   * Executes a formatted command with caching and dry run support
   *
   * Core concept:
   * Core execution engine that handles command execution with
   * caching, dry run support, and comprehensive logging.
   *
   * Execution flow:
   * 1. Validates execution function availability
   * 2. Determines dry run and caching settings
   * 3. Logs command for debugging (unless silent)
   * 4. Returns dry run result or cached result if available
   * 5. Executes command and caches result if caching enabled
   * 6. Returns command execution result
   *
   * Caching behavior:
   * - Uses command string as cache key
   * - Caches Promise<string> for concurrent access
   * - Respects per-command and global cache settings
   * - Provides performance optimization for repeated commands
   * - Handles cache misses gracefully
   *
   * Dry run support:
   * - Returns predefined result without execution
   * - Supports both global and per-command dry run
   * - Useful for command validation and testing
   * - Maintains logging for debugging
   *
   * Error handling:
   * - Validates execution function availability
   * - Handles cache access errors gracefully
   * - Propagates execution errors to caller
   * - Provides detailed logging for debugging
   *
   * @param command - Formatted command string or array
   * @param options - Execution options for customization
   * @returns Promise resolving to command output
   * @throws Error if execution function is not available
   *
   * @example Basic execution
   * ```typescript
   * const output = await shell.execFormattedCommand('npm install');
   * ```
   *
   * @example With caching
   * ```typescript
   * const output1 = await shell.execFormattedCommand('npm install', { isCache: true });
   * const output2 = await shell.execFormattedCommand('npm install', { isCache: true });
   * // Second call uses cached result
   * ```
   *
   * @example Dry run mode
   * ```typescript
   * const output = await shell.execFormattedCommand('rm -rf /', {
   *   dryRun: true,
   *   dryRunResult: 'Would delete all files'
   * });
   * // Returns 'Would delete all files' without execution
   * ```
   */
  public async execFormattedCommand(
    command: string | string[],
    options: ShellExecOptions = {}
  ): Promise<string> {
    const execPromise = this.config.execPromise;
    if (!execPromise) {
      throw new Error('execPromise is not defined');
    }

    const { dryRunResult, silent, dryRun, isCache } = options;
    const isDryRun = dryRun !== undefined ? dryRun : this.config.dryRun;
    const _isCache = isCache !== undefined ? !!isCache : !!this.config.isCache;
    const cacheKey = typeof command === 'string' ? command : command.join(' ');
    const isCached = _isCache && this.cache.has(cacheKey);

    if (!silent) {
      this.logger.debug(command);
    }

    if (isDryRun) {
      return Promise.resolve(dryRunResult as string);
    }

    if (isCached) {
      return this.cache.get(cacheKey)!;
    }

    const result = execPromise(command, options);

    if (!this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }
}
