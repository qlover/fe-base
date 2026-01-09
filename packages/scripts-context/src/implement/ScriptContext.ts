import { FeConfig } from '../feConfig';
import { merge, get } from 'lodash-es';
import { Env } from '@qlover/env-loader';
import { ScriptSharedInterface } from '../interface/ScriptSharedInterface';
import { LoggerInterface } from '@qlover/logger';
import type { ShellInterface } from '../interface/ShellInterface';
import { ScriptContextInterface } from '../interface/ScriptContextInterface';
import { ExecutorContextImpl } from '@qlover/fe-corekit';
import { initializeOptions } from '../utils/initializeOptions';
import { contextDefaults } from '../utils/contextDefaults';

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
  extends ExecutorContextImpl<Opt>
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
      contextDefaults.options(name, opts);

    super(options);

    this.feConfig = feConfig;
    this.logger = logger;
    this.shell = shell;
    this.dryRun = dryRun;
    this.verbose = verbose;

    // Initialize options with configuration extraction and default values
    this.setOptions(initializeOptions(name, feConfig, options, logger));
  }

  /**
   * @override
   */
  public get options(): Opt {
    return this.parameters;
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
    this.setParameters(merge(this.options, options));
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
