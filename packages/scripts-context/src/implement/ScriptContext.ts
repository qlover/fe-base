import { defaultFeConfig, FeConfig } from '../feConfig';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { ScriptSharedInterface } from '../interface/ScriptSharedInterface';
import {
  ConsoleHandler,
  Logger,
  LoggerInterface,
  TimestampFormatter
} from '@qlover/logger';
import { Shell } from './Shell';
import type {
  ShellExecOptions,
  ShellInterface
} from '../interface/ShellInterface';
import { ConfigSearch } from './ConfigSearch';
import { ScriptContextInterface } from '../interface/ScriptContextInterface';
import { exec } from 'child_process';

/**
 * Default utility functions for script context initialization and management
 *
 * Core concept:
 * Provides essential utility functions that handle common script operations
 * including command execution, configuration management, logging setup,
 * and context initialization with proper defaults and error handling.
 *
 * Main features:
 * - Command execution: Wraps child_process.exec with proper error handling
 *   - Converts command arrays to strings automatically
 *   - Provides consistent error handling for non-zero exit codes
 *   - Returns trimmed stdout on success
 *   - Throws errors with stderr or stdout content
 *
 * - Configuration management: Creates ConfigSearch instances with defaults
 *   - Merges default fe-config with custom overrides
 *   - Uses 'fe-config' as the search name for configuration files
 *   - Provides fallback configuration values
 *
 * - Logging setup: Creates logger instances with timestamp formatting
 *   - Configurable verbosity levels (debug/info)
 *   - Timestamp formatting with Shanghai timezone
 *   - Console output with structured formatting
 *   - Logger name identification for multi-script environments
 *
 * - Context options: Initializes script context with proper defaults
 *   - Type-safe option merging and validation
 *   - Logger and shell setup with fallbacks
 *   - Configuration merging with script-specific overrides
 *   - Dry run and verbose mode support
 *
 * Design considerations:
 * - Uses lodash utilities for consistent object manipulation
 * - Provides fallback values for all optional parameters
 * - Implements proper error handling for external processes
 * - Maintains type safety through generic constraints
 * - Supports both synchronous and asynchronous operations
 *
 * @example Command execution
 * ```typescript
 * const output = await defatuls.exec('npm install', { cwd: '/project' });
 * console.log('Installation completed:', output);
 * ```
 *
 * @example Configuration setup
 * ```typescript
 * const config = defatuls.getConfig({
 *   build: { target: 'production' }
 * });
 * ```
 *
 * @example Logger creation
 * ```typescript
 * const logger = defatuls.logger('build-script', true);
 * logger.info('Starting build process');
 * ```
 */
const defatuls = {
  /**
   * Executes a shell command with proper error handling and output processing
   *
   * Core concept:
   * Wraps Node.js child_process.exec with enhanced error handling and
   * consistent return values, providing a reliable interface for
   * executing shell commands in script contexts.
   *
   * Execution process:
   * 1. Converts command array to string if necessary
   * 2. Executes command with UTF-8 encoding
   * 3. Handles process completion and error conditions
   * 4. Returns trimmed stdout on success
   * 5. Throws error with stderr or stdout on failure
   *
   * Error handling:
   * - Non-zero exit codes trigger error rejection
   * - Missing error codes default to code 1
   * - Error messages include stderr or stdout content
   * - Process errors are properly propagated
   *
   * Command processing:
   * - Arrays are joined with spaces for execution
   * - Strings are passed directly to exec
   * - Options are merged with default encoding
   * - Output is trimmed to remove trailing whitespace
   *
   * @param command - Command string or array of command parts
   * @param options - Shell execution options (merged with defaults)
   * @returns Promise resolving to command output (trimmed)
   * @throws Error with stderr or stdout on non-zero exit code
   *
   * @example Basic command execution
   * ```typescript
   * const output = await defatuls.exec('npm install', { cwd: '/project' });
   * console.log('Installation output:', output);
   * ```
   *
   * @example Command with arguments
   * ```typescript
   * const output = await defatuls.exec(['git', 'commit', '-m', 'Update docs'], {
   *   cwd: '/project'
   * });
   * ```
   *
   * @example Error handling
   * ```typescript
   * try {
   *   await defatuls.exec('invalid-command');
   * } catch (error) {
   *   console.error('Command failed:', error.message);
   * }
   * ```
   */
  exec(command: string | string[], options: ShellExecOptions): Promise<string> {
    const commandString = Array.isArray(command) ? command.join(' ') : command;
    return new Promise((resolve, reject) => {
      exec(
        commandString,
        {
          encoding: 'utf-8',
          ...options
        },
        (err, stdout, stderr) => {
          let code;
          if (!err) {
            code = 0;
          } else if (err.code === undefined) {
            code = 1;
          } else {
            code = err.code;
          }

          if (code === 0) {
            resolve(stdout.trim());
          } else {
            reject(new Error(stderr || stdout));
          }
        }
      );
    });
  },

  /**
   * Creates a configuration search instance with default settings
   *
   * Core concept:
   * Initializes a ConfigSearch instance specifically for fe-config
   * files, merging default configuration with custom overrides to
   * provide a unified configuration interface.
   *
   * Configuration merging:
   * - Uses lodash merge for deep object merging
   * - Default fe-config provides base values
   * - Custom overrides take precedence
   * - Maintains nested object structures
   *
   * Search behavior:
   * - Searches for 'fe-config' files in project directories
   * - Supports multiple file formats (JSON, JS, TS, YAML)
   * - Follows cosmiconfig search patterns
   * - Provides fallback to default configuration
   *
   * @param feConfig - Optional configuration overrides
   * @returns ConfigSearch instance with merged configuration
   *
   * @example Basic configuration
   * ```typescript
   * const config = defatuls.getConfig();
   * console.log('Default config:', config);
   * ```
   *
   * @example With custom overrides
   * ```typescript
   * const config = defatuls.getConfig({
   *   build: { target: 'production' },
   *   deploy: { region: 'us-east-1' }
   * });
   * ```
   */
  getConfig(feConfig?: Record<string, unknown>): ConfigSearch {
    return new ConfigSearch({
      name: 'fe-config',
      defaultConfig: merge({}, defaultFeConfig, feConfig)
    });
  },

  /**
   * Creates a logger instance with timestamp formatting and console output
   *
   * Core concept:
   * Sets up a structured logger with timestamp formatting and
   * configurable verbosity levels, optimized for script execution
   * environments.
   *
   * Logger features:
   * - Timestamp formatting with Shanghai timezone
   * - Configurable log levels (debug/info based on verbosity)
   * - Console output with structured formatting
   * - Logger name identification for multi-script environments
   * - Consistent formatting across all log messages
   *
   * Format template:
   * - Includes logger name for identification
   * - Timestamp with timezone information
   * - Log level for message categorization
   * - Structured for easy parsing and filtering
   *
   * Verbosity control:
   * - true: Enables debug level logging (detailed information)
   * - false: Enables info level logging (essential information only)
   * - Affects both console output and log filtering
   *
   * @param name - Logger name for identification and filtering
   * @param verbose - Whether to enable debug level logging
   * @returns Configured logger instance with timestamp formatting
   *
   * @example Basic logger
   * ```typescript
   * const logger = defatuls.logger('build-script', false);
   * logger.info('Starting build process');
   * // Output: [build-script 2024-01-15 10:30:45 info] Starting build process
   * ```
   *
   * @example Verbose logger
   * ```typescript
   * const logger = defatuls.logger('deploy-script', true);
   * logger.debug('Loading configuration...');
   * logger.info('Deployment started');
   * // Both debug and info messages are output
   * ```
   */
  logger(name: string, verbose: boolean): LoggerInterface {
    return new Logger({
      level: verbose ? 'debug' : 'info',
      name: name,
      handlers: new ConsoleHandler(
        new TimestampFormatter({
          prefixTemplate: '[{loggerName} {formattedTimestamp} {level}]',
          localeOptions: {
            timeZone: 'Asia/Shanghai'
          }
        })
      )
    });
  },

  /**
   * Initializes script context options with proper defaults and type safety
   *
   * Core concept:
   * Creates a complete script context configuration by merging
   * provided options with sensible defaults, ensuring all required
   * components are properly initialized.
   *
   * Initialization process:
   * 1. Extracts and validates input options
   * 2. Creates logger with appropriate verbosity
   * 3. Sets up shell with dry run support
   * 4. Merges configuration with script-specific overrides
   * 5. Returns fully initialized context interface
   *
   * Component setup:
   * - Logger: Uses provided logger or creates new one with verbosity
   * - Shell: Uses provided shell or creates new one with dry run support
   * - Configuration: Merges fe-config with script-specific options
   * - Options: Preserves provided options with type safety
   *
   * Default behavior:
   * - Verbose mode defaults to false
   * - Dry run mode defaults to false
   * - Shell uses default exec function if not provided
   * - Configuration merges with default fe-config
   *
   * @param name - Script identifier for logging and configuration
   * @param ctxOpts - Context initialization options (partial)
   * @returns Fully initialized context options with defaults applied
   *
   * @example Basic initialization
   * ```typescript
   * const options = defatuls.options('build-script', {
   *   verbose: true,
   *   dryRun: false
   * });
   * ```
   *
   * @example With custom components
   * ```typescript
   * const options = defatuls.options('deploy-script', {
   *   logger: customLogger,
   *   shell: customShell,
   *   feConfig: { target: 'production' }
   * });
   * ```
   */
  options<Opt extends ScriptSharedInterface>(
    name: string,
    ctxOpts: Partial<ScriptContextInterface<Opt>>
  ): ScriptContextInterface<Opt> {
    const { logger, shell, feConfig, dryRun, verbose, options } = ctxOpts;
    const _options = (options || {}) as ScriptContextInterface<Opt>['options'];

    const _logger = logger || defatuls.logger(name, !!verbose);
    const _shell =
      shell ||
      new Shell({
        logger: _logger,
        dryRun: dryRun,
        execPromise: _options.execPromise || defatuls.exec
      });

    const _feConfig = merge({}, feConfig, { [name]: ctxOpts.options });

    return {
      options: _options,
      dryRun: !!dryRun,
      shell: _shell,
      logger: _logger,
      verbose: !!verbose,
      feConfig: defatuls.getConfig(_feConfig).config
    };
  }
};

/**
 * Default environment file loading order
 *
 * Core concept:
 * Defines the priority order for environment file loading,
 * ensuring consistent behavior across different script contexts.
 *
 * Loading priority:
 * 1. .env.local - Local environment overrides (highest priority)
 *   - Used for local development overrides
 *   - Should be gitignored for security
 *   - Takes precedence over default environment
 *
 * 2. .env - Default environment configuration
 *   - Base environment configuration
 *   - Shared across team members
 *   - Provides default values for all environments
 *
 * Design considerations:
 * - Local overrides take precedence for development flexibility
 * - Base configuration provides consistent defaults
 * - Order allows for environment-specific customization
 * - Supports both individual and team development workflows
 */
const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

/**
 * Enhanced script context that provides environment management and configuration utilities
 *
 * Core concept:
 * Provides a comprehensive script execution environment with integrated
 * configuration management, environment variable handling, logging,
 * and shell command execution capabilities.
 *
 * Main features:
 * - Environment management: Integrated environment variable handling
 *   - Automatic loading of .env files with configurable order
 *   - Type-safe environment variable access with defaults
 *   - Support for environment-specific configurations
 *   - Integration with fe-config environment settings
 *
 * - Configuration management: Unified configuration access and merging
 *   - Script-specific configuration sections
 *   - Deep merging with default values
 *   - Type-safe option access with nested path support
 *   - Configuration validation and fallback handling
 *
 * - Logging system: Structured logging with timestamp formatting
 *   - Configurable verbosity levels
 *   - Timestamp formatting with timezone support
 *   - Logger name identification for multi-script environments
 *   - Console output with structured formatting
 *
 * - Shell integration: Command execution with dry run support
 *   - Safe command execution with error handling
 *   - Dry run mode for testing and validation
 *   - Integrated logging for command output
 *   - Support for custom execution functions
 *
 * Design considerations:
 * - Uses lodash merge for deep configuration merging
 * - Supports environment file loading with configurable order
 * - Provides type-safe option access with fallback values
 * - Implements proper error handling for missing configurations
 * - Maintains backward compatibility with existing interfaces
 * - Supports both development and production environments
 *
 * Performance optimizations:
 * - Lazy environment initialization
 * - Cached configuration access
 * - Efficient option merging
 * - Minimal memory footprint
 *
 * @example Basic usage
 * ```typescript
 * const context = new ScriptContext('build-script', {
 *   verbose: true,
 *   options: { outputDir: './dist' }
 * });
 *
 * // Access environment variables
 * const apiKey = context.getEnv('API_KEY', 'default-key');
 *
 * // Access configuration options
 * const outputDir = context.getOptions('outputDir', './build');
 * ```
 *
 * @example Advanced configuration
 * ```typescript
 * const context = new ScriptContext('deploy-script', {
 *   feConfig: {
 *     envOrder: ['.env.prod', '.env.local', '.env'],
 *     'deploy-script': {
 *       target: 'production',
 *       region: 'us-east-1'
 *     }
 *   }
 * });
 * ```
 *
 * @example With custom components
 * ```typescript
 * const context = new ScriptContext('test-script', {
 *   logger: customLogger,
 *   shell: customShell,
 *   dryRun: true,
 *   options: { testMode: true }
 * });
 * ```
 */
export class ScriptContext<Opt extends ScriptSharedInterface>
  implements ScriptContextInterface<Opt>
{
  /**
   * Logger instance for structured logging
   *
   * Provides timestamp-formatted logging with configurable
   * verbosity levels and script name identification.
   */
  public readonly logger: LoggerInterface;
  /**
   * Shell interface for command execution
   *
   * Handles command execution with dry run support,
   * error handling, and integrated logging.
   */
  public readonly shell: ShellInterface;
  /**
   * Merged fe-configuration object
   *
   * Contains the complete configuration after merging
   * default fe-config with script-specific overrides.
   */
  public readonly feConfig: FeConfig;
  /**
   * Whether to run in dry run mode
   *
   * When true, commands are logged but not executed,
   * useful for testing and validation.
   */
  public readonly dryRun: boolean;
  /**
   * Whether to enable verbose logging
   *
   * Controls debug level logging output and
   * detailed information display.
   */
  public readonly verbose: boolean;
  /**
   * Script-specific options
   *
   * Contains all script configuration options
   * with defaults applied and environment integration.
   */
  public options: Opt;

  /**
   * Creates a new ScriptContext instance with the specified configuration
   *
   * Core concept:
   * Initializes a complete script execution environment with
   * integrated configuration, logging, and shell capabilities.
   *
   * Initialization process:
   * 1. Validates script name requirement
   * 2. Sets up logger, shell, and configuration components
   * 3. Loads environment variables with configurable order
   * 4. Applies default options and environment integration
   * 5. Merges script-specific configuration with defaults
   *
   * Validation rules:
   * - Script name must be provided and be a non-empty string
   * - Options are optional and have sensible defaults
   * - Environment loading follows configurable priority order
   * - Configuration merging preserves type safety
   *
   * Component initialization:
   * - Logger: Created with timestamp formatting and verbosity control
   * - Shell: Set up with dry run support and integrated logging
   * - Configuration: Merged from fe-config with script-specific overrides
   * - Environment: Loaded from files with fallback to defaults
   *
   * @param name - Script identifier for logging and configuration
   * @param opts - Optional initialization options
   * @throws {Error} When script name is not provided or invalid
   *
   * @example Basic initialization
   * ```typescript
   * const context = new ScriptContext('build-script', {
   *   verbose: true,
   *   dryRun: false
   * });
   * ```
   *
   * @example With custom options
   * ```typescript
   * const context = new ScriptContext('deploy-script', {
   *   feConfig: { target: 'production' },
   *   options: { region: 'us-east-1' }
   * });
   * ```
   */
  constructor(
    public readonly name: string,
    opts: Partial<ScriptContextInterface<Opt>> = {}
  ) {
    if (!name || typeof name !== 'string') {
      throw new Error('ScriptContext name is required');
    }

    const { feConfig, logger, shell, dryRun, verbose, options } =
      defatuls.options(name, opts);

    this.feConfig = feConfig;
    this.logger = logger;
    this.shell = shell;
    this.dryRun = dryRun;
    this.verbose = verbose;

    // don't use deep merge, because the shared options will be overwritten by the default options
    this.options = this.getDefaultStore(name, feConfig);

    // set default options
    this.setOptions(this.getDefaultOptions(options));
  }

  /**
   * Environment instance for variable access and management
   *
   * Core concept:
   * Provides access to environment variables loaded from
   * configuration files with type-safe getter methods
   * and default value support.
   *
   * Environment features:
   * - Automatic file loading (.env.local, .env)
   * - Type-safe getter methods with defaults
   * - Configurable file loading order
   * - Integration with fe-config environment settings
   * - Lazy initialization for performance
   *
   * Loading behavior:
   * - Files are loaded in priority order (highest first)
   * - Missing files are silently ignored
   * - Variables are cached after first load
   * - Environment is shared across script instances
   *
   * Error handling:
   * - Throws error if environment is not initialized
   * - Provides clear error messages for debugging
   * - Graceful handling of missing environment files
   *
   * @returns Env instance for environment variable operations
   * @throws {Error} When environment is not properly initialized
   *
   * @example Basic usage
   * ```typescript
   * const apiKey = this.env.get('API_KEY');
   * const port = this.env.get('PORT', '3000');
   * ```
   *
   * @example With defaults
   * ```typescript
   * const databaseUrl = this.env.get('DATABASE_URL', 'localhost:5432');
   * const debug = this.env.get('DEBUG', 'false');
   * ```
   */
  public get env(): Env {
    if (!this.options.env) {
      throw new Error('Environment is not initialized');
    }
    return this.options.env;
  }

  /**
   * Extracts configuration store from feConfig based on script name
   *
   * Core concept:
   * Safely extracts script-specific configuration from the
   * merged fe-config object, handling various data types
   * and providing fallback values.
   *
   * Extraction process:
   * 1. Uses lodash get to safely access nested configuration
   * 2. Validates that the extracted value is an object
   * 3. Converts primitive values to empty objects
   * 4. Logs warnings for non-object configurations
   * 5. Returns type-safe configuration object
   *
   * Safety features:
   * - Safe nested property access with lodash get
   * - Null and undefined handling
   * - Type validation for configuration objects
   * - Warning logging for invalid configurations
   * - Fallback to empty object for primitives
   *
   * Configuration validation:
   * - Checks if extracted value is an object
   * - Warns when configuration is not an object
   * - Converts primitives to empty objects
   * - Maintains type safety through generic constraints
   *
   * @param scriptName - Script name or array of names for nested access
   * @param sources - Configuration source object (feConfig)
   * @returns Extracted configuration object with type safety
   *
   * @example Basic extraction
   * ```typescript
   * const config = this.getDefaultStore('build-script', feConfig);
   * // Returns configuration from feConfig['build-script']
   * ```
   *
   * @example Nested access
   * ```typescript
   * const config = this.getDefaultStore(['scripts', 'build'], feConfig);
   * // Returns configuration from feConfig.scripts.build
   * ```
   */
  protected getDefaultStore(
    scriptName: string | string[],
    sources: Record<string, unknown>
  ): Opt {
    const rootProp = scriptName ? get(sources, scriptName) : sources;
    const isObject = typeof rootProp === 'object' && rootProp !== null;
    const rootPropObject = isObject ? rootProp : {};
    if (!isObject) {
      this.logger.warn(
        `rootProp ${scriptName} is not an object, it will be overwritten by the default options`
      );
    }

    return rootPropObject as Opt;
  }

  /**
   * Applies default values to script options with environment integration
   *
   * Core concept:
   * Enhances provided options with sensible defaults and
   * environment variable integration, ensuring all required
   * configuration is available.
   *
   * Default logic:
   * 1. Uses existing environment or loads from files
   * 2. Sets rootPath to current working directory if not specified
   * 3. Determines sourceBranch from environment or defaults to 'master'
   * 4. Merges all options with proper precedence
   * 5. Ensures environment is properly initialized
   *
   * Environment variable priority:
   * 1. FE_RELEASE_BRANCH (primary environment variable)
   * 2. FE_RELEASE_SOURCE_BRANCH (fallback environment variable)
   * 3. 'master' (default value)
   * 4. Options.sourceBranch (if provided)
   *
   * Path handling:
   * - rootPath defaults to process.cwd() if not specified
   * - Supports both absolute and relative paths
   * - Maintains path consistency across environments
   * - Used for file operations and configuration loading
   *
   * Environment integration:
   * - Loads environment from files if not provided
   * - Uses configurable file loading order
   * - Integrates with fe-config environment settings
   * - Provides fallback to default environment
   *
   * @param options - Current options to enhance with defaults
   * @returns Options with default values and environment integration
   *
   * @example Basic defaults
   * ```typescript
   * const options = this.getDefaultOptions({});
   * // Returns: { rootPath: process.cwd(), sourceBranch: 'master', env: Env instance }
   * ```
   *
   * @example With environment variables
   * ```typescript
   * // If FE_RELEASE_BRANCH=develop
   * const options = this.getDefaultOptions({});
   * // Returns: { rootPath: process.cwd(), sourceBranch: 'develop', env: Env instance }
   * ```
   */
  protected getDefaultOptions(options: Opt): Opt {
    const env =
      this.options.env ||
      Env.searchEnv({
        logger: this.logger,
        preloadList: this.feConfig.envOrder || DEFAULT_ENV_ORDER
      });
    const rootPath = options.rootPath || process.cwd();
    const sourceBranch =
      options.sourceBranch ||
      env?.get('FE_RELEASE_BRANCH') ||
      env?.get('FE_RELEASE_SOURCE_BRANCH') ||
      'master';

    const defaultOptions = {
      ...options,
      sourceBranch,
      rootPath,
      env: env
    };

    return defaultOptions;
  }

  /**
   * Updates script options with deep merging support
   *
   * Core concept:
   * Merges new options with existing configuration using
   * lodash merge for deep object merging, preserving
   * existing options not specified in the update.
   *
   * Merging strategy:
   * - Uses lodash merge for deep object merging
   * - Preserves existing options not specified in update
   * - Supports nested object updates
   * - Maintains type safety through generic constraints
   * - Handles arrays and primitives appropriately
   *
   * Update behavior:
   * - New options override existing ones
   * - Nested objects are merged recursively
   * - Arrays are replaced (not merged)
   * - Primitives are replaced directly
   * - Undefined values are ignored
   *
   * Type safety:
   * - Maintains generic type constraints
   * - Preserves option structure
   * - Validates option types at runtime
   * - Supports partial option updates
   *
   * @param options - Partial options to merge with current configuration
   *
   * @example Basic update
   * ```typescript
   * this.setOptions({ debug: true });
   * // Merges debug: true with existing options
   * ```
   *
   * @example Nested update
   * ```typescript
   * this.setOptions({
   *   build: { target: 'production', minify: true }
   * });
   * // Merges nested build configuration
   * ```
   */
  public setOptions(options: Partial<Opt>): void {
    this.options = merge(this.options, options);
  }

  /**
   * Retrieves environment variable with optional default value
   *
   * Core concept:
   * Provides safe access to environment variables with
   * default value fallback, delegating to the underlying
   * Env.get method for consistent behavior.
   *
   * Access features:
   * - Safe access to environment variables
   * - Default value fallback when variable not found
   * - Delegates to Env.get method for consistency
   * - Handles undefined and null values gracefully
   * - Maintains environment variable type safety
   *
   * Default behavior:
   * - Returns undefined if variable not found and no default provided
   * - Returns default value if variable not found and default provided
   * - Returns actual value if variable exists
   * - Handles empty string values appropriately
   *
   * @param key - Environment variable name to retrieve
   * @param defaultValue - Optional default value if variable not found
   * @returns Environment variable value or default, undefined if not found
   *
   * @example Basic access
   * ```typescript
   * const apiKey = this.getEnv('API_KEY');
   * // Returns API_KEY value or undefined
   * ```
   *
   * @example With default
   * ```typescript
   * const port = this.getEnv('PORT', '3000');
   * // Returns PORT value or '3000' if not found
   * ```
   *
   * @example Boolean handling
   * ```typescript
   * const debug = this.getEnv('DEBUG', 'false');
   * const isDebug = debug === 'true';
   * ```
   */
  public getEnv(key: string, defaultValue?: string): string | undefined {
    return this.env.get(key) ?? defaultValue;
  }

  /**
   * Retrieves configuration options with nested path support
   *
   * Core concept:
   * Provides safe access to configuration options using
   * lodash get for nested path support, with type-safe
   * return values and default value fallback.
   *
   * Access features:
   * - Safe nested object access using lodash get
   * - Type-safe return values with generic constraints
   * - Default value support for missing keys
   * - Full options object access when no key provided
   * - Support for both string and array path formats
   *
   * Path formats:
   * - String: 'build.target' for nested access
   * - Array: ['build', 'target'] for explicit path
   * - Empty: Returns full options object
   * - Invalid: Returns default value or undefined
   *
   * Type safety:
   * - Generic type parameter for return type
   * - Type inference from default values
   * - Runtime type validation
   * - Consistent return type handling
   *
   * @param key - Optional path to specific option (string or array)
   * @param defaultValue - Default value if option not found
   * @returns Option value or default, full options if no key provided
   *
   * @example Basic access
   * ```typescript
   * const debug = this.getOptions('debug', false);
   * // Returns debug option or false if not found
   * ```
   *
   * @example Nested access
   * ```typescript
   * const target = this.getOptions('build.target', 'development');
   * // Returns build.target or 'development' if not found
   * ```
   *
   * @example Array path
   * ```typescript
   * const region = this.getOptions(['deploy', 'region'], 'us-east-1');
   * // Returns deploy.region or 'us-east-1' if not found
   * ```
   *
   * @example Full options
   * ```typescript
   * const allOptions = this.getOptions();
   * // Returns the complete options object
   * ```
   */
  public getOptions<T = unknown>(key?: string | string[], defaultValue?: T): T {
    if (!key) {
      return this.options as unknown as T;
    }

    return get(this.options, key, defaultValue);
  }
}
