import { FeScriptContext, getFeConfigSearch } from '../implement/ScriptContext';
import merge from 'lodash/merge';
import get from 'lodash/get';
import { Env } from '@qlover/env-loader';
import { ScriptShared } from './ScriptShared';
import {
  ConsoleHandler,
  Logger,
  LoggerInterface,
  TimestampFormatter
} from '@qlover/logger';
import { ExecPromiseFunction, Shell } from '../implement/Shell';
import { ShellInterface } from '../interface/ShellInterface';
import { FeConfig } from '../feConfig';
import { execPromise } from '../implement/execPromise';

/**
 * Default environment file loading order
 *
 * Priority order for environment file loading:
 * 1. .env.local - Local environment overrides (highest priority)
 * 2. .env - Default environment configuration
 */
const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

/**
 * Creates a default logger instance with timestamp formatting
 *
 * Features:
 * - Configurable log level based on verbose flag
 * - Timestamp formatting with Shanghai timezone
 * - Console output with structured format
 *
 * @param name - Logger name for identification
 * @param verbose - Whether to enable debug level logging
 * @returns Configured Logger instance
 *
 * @example
 * ```typescript
 * const logger = defaultLogger('my-script', true);
 * logger.debug('Debug message');
 * logger.info('Info message');
 * ```
 */
function defaultLogger(name: string, verbose: boolean) {
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
}

/**
 * Applies default options to script context configuration
 *
 * Merges user-provided options with sensible defaults:
 * - Creates logger if not provided
 * - Merges feConfig with script-specific options
 * - Preserves verbose flag for logging control
 *
 * @param name - Script name for configuration namespace
 * @param ctxOpts - User-provided context options
 * @returns Merged options with defaults applied
 *
 * @example
 * ```typescript
 * const options = defaultOptions('build-script', {
 *   verbose: true,
 *   options: { outputDir: './dist' }
 * });
 * ```
 */
function defaultOptions<Opt extends ScriptShared>(
  name: string,
  ctxOpts: Partial<FeScriptContext<Opt>>
): FeScriptContext<Opt> {
  const { logger, shell, feConfig, dryRun, verbose, options } = ctxOpts;
  const _options = options || ({} as ScriptContextOptions<Opt>);
  const _logger = logger || defaultLogger(name, !!verbose);
  const _shell =
    shell ||
    new Shell({
      logger: _logger,
      dryRun: dryRun,
      execPromise: _options.execPromise || execPromise
    });

  const _feConfig = merge({}, feConfig, { [name]: ctxOpts.options });

  return {
    options: _options || {},
    dryRun: !!dryRun,
    shell: _shell,
    logger: _logger,
    verbose: !!verbose,
    feConfig: getFeConfigSearch(_feConfig).config
  };
}

type ScriptContextOptions<T> = T & {
  execPromise?: ExecPromiseFunction;
};

/**
 * Enhanced script context that provides environment management and configuration utilities
 *
 * Core Features:
 * - Environment variable loading and management
 * - Configuration merging with defaults
 * - Structured logging with timestamps
 * - Options validation and type safety
 *
 * Design Considerations:
 * - Uses lodash merge for deep configuration merging
 * - Supports environment file loading with configurable order
 * - Provides type-safe option access with fallback values
 * - Implements proper error handling for missing configurations
 *
 * @example Basic Usage
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
 * @example Advanced Configuration
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
 */
export default class ScriptContext<Opt extends ScriptShared> {
  /** Logger instance */
  public readonly logger: LoggerInterface;
  /** Shell instance */
  public readonly shell: ShellInterface;
  /** Fe configuration */
  public readonly feConfig: FeConfig;
  /** Dry run flag */
  public readonly dryRun: boolean;
  /** Verbose logging flag */
  public readonly verbose: boolean;
  /** Script-specific options */
  public options: ScriptContextOptions<Opt>;

  /**
   * Creates a new script context with configuration and environment setup
   *
   * Initialization Process:
   * 1. Validates script name requirement
   * 2. Applies default options and logger configuration
   * 3. Loads environment variables from files
   * 4. Merges configuration with defaults
   * 5. Sets up option store with type safety
   *
   * @param name - Unique script identifier (required for configuration namespace)
   * @param opts - Optional configuration overrides
   *
   * @throws {Error} When script name is missing or invalid
   *
   * @example
   * ```typescript
   * // Basic initialization
   * const context = new ScriptContext('my-script');
   *
   * // With custom options
   * const context = new ScriptContext('build-script', {
   *   verbose: true,
   *   options: {
   *     rootPath: '/custom/path',
   *     sourceBranch: 'develop'
   *   }
   * });
   * ```
   */
  constructor(
    /**
     * Unique script identifier used for configuration namespace and logging identification
     *
     * @example
     * ```typescript
     * const context = new ScriptContext('my-script');
     * ```
     */
    public readonly name: string,
    opts: Partial<FeScriptContext<Opt>> = {}
  ) {
    if (!name || typeof name !== 'string') {
      throw new Error('ScriptContext name is required');
    }

    const { feConfig, logger, shell, dryRun, verbose, options } =
      defaultOptions(name, opts);

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
   * Provides access to loaded environment variables with:
   * - Automatic file loading (.env.local, .env)
   * - Type-safe getter methods
   * - Default value support
   *
   * @returns Env instance for environment variable operations
   * @throws {Error} When environment is not properly initialized
   *
   * @example
   * ```typescript
   * // Get environment variable with default
   * const apiUrl = this.env.get('API_URL', 'http://localhost:3000');
   *
   * // Check if variable exists
   * if (this.env.has('DEBUG_MODE')) {
   *   console.log('Debug mode enabled');
   * }
   * ```
   */
  get env(): Env {
    if (!this.options.env) {
      throw new Error('Environment is not initialized');
    }
    return this.options.env;
  }

  /**
   * Extracts configuration store from feConfig based on script name
   *
   * Implementation Details:
   * 1. Uses lodash get to safely access nested configuration
   * 2. Handles primitive values by converting to empty object
   * 3. Logs warning when configuration is not an object
   * 4. Returns type-safe configuration object
   *
   * @param scriptName - Script name or array of names for nested access
   * @param sources - Configuration source object
   * @returns Extracted configuration object
   *
   * @example
   * ```typescript
   * // Single script name
   * const config = this.getDefaultStore('build-script', feConfig);
   *
   * // Nested configuration access
   * const config = this.getDefaultStore(['scripts', 'build'], feConfig);
   * ```
   */
  protected getDefaultStore(
    scriptName: string | string[],
    sources: Record<string, unknown>
  ): Opt {
    // set context props
    const rootProp = scriptName ? get(sources, scriptName) : sources;
    // Handle case where rootProp is a primitive value
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
   * Default Logic:
   * 1. Uses existing environment or loads from files
   * 2. Sets rootPath to current working directory if not specified
   * 3. Determines sourceBranch from environment or defaults to 'master'
   * 4. Merges all options with proper precedence
   *
   * Environment Variable Priority:
   * 1. FE_RELEASE_BRANCH (primary)
   * 2. FE_RELEASE_SOURCE_BRANCH (fallback)
   * 3. 'master' (default)
   *
   * @param options - Current options to enhance with defaults
   * @returns Options with default values applied
   *
   * @example
   * ```typescript
   * const enhancedOptions = this.getDefaultOptions({
   *   rootPath: '/custom/path',
   *   // sourceBranch will be determined from environment
   * });
   * ```
   */
  protected getDefaultOptions(options: Opt): Opt {
    const env = this.options.env;
    const rootPath = options.rootPath || process.cwd();
    const sourceBranch =
      options.sourceBranch ||
      env?.get('FE_RELEASE_BRANCH') ||
      env?.get('FE_RELEASE_SOURCE_BRANCH') ||
      'master';

    const defaultOptions = {
      ...options,
      // use currentBranch by default
      sourceBranch,
      rootPath,
      env:
        env ||
        Env.searchEnv({
          logger: this.logger,
          preloadList: this.feConfig.envOrder || DEFAULT_ENV_ORDER
        })
    };

    return defaultOptions;
  }

  /**
   * Updates script options with deep merging support
   *
   * Merging Strategy:
   * - Uses lodash merge for deep object merging
   * - Preserves existing options not specified in update
   * - Supports nested object updates
   * - Maintains type safety through generic constraints
   *
   * @param options - Partial options to merge with current configuration
   *
   * @example
   * ```typescript
   * // Update single option
   * this.setOptions({ rootPath: '/new/path' });
   *
   * // Update multiple options
   * this.setOptions({
   *   sourceBranch: 'develop',
   *   buildMode: 'production'
   * });
   *
   * // Update nested configuration
   * this.setOptions({
   *   build: {
   *     outputDir: './dist',
   *     minify: true
   *   }
   * });
   * ```
   */
  setOptions(options: Partial<Opt>): void {
    this.options = merge(this.options, options);
  }

  /**
   * Retrieves environment variable with optional default value
   *
   * Features:
   * - Safe access to environment variables
   * - Default value fallback
   * - Delegates to Env.get method
   *
   * @param key - Environment variable name
   * @param defaultValue - Optional default value if variable not found
   * @returns Environment variable value or default
   *
   * @example
   * ```typescript
   * // Get required variable
   * const apiKey = this.getEnv('API_KEY');
   *
   * // Get with default
   * const port = this.getEnv('PORT', '3000');
   *
   * // Check for optional feature flag
   * const debugMode = this.getEnv('DEBUG_MODE', 'false');
   * ```
   */
  getEnv(key: string, defaultValue?: string): string | undefined {
    return this.env.get(key) ?? defaultValue;
  }

  /**
   * Retrieves configuration options with nested path support
   *
   * Features:
   * - Safe nested object access using lodash get
   * - Type-safe return values
   * - Default value support for missing keys
   * - Full options object access when no key provided
   *
   * @param key - Optional path to specific option (string or array)
   * @param defaultValue - Default value if option not found
   * @returns Option value or default, full options if no key provided
   *
   * @example
   * ```typescript
   * // Get full options object
   * const allOptions = this.getOptions();
   *
   * // Get specific option
   * const outputDir = this.getOptions('outputDir', './dist');
   *
   * // Get nested option
   * const buildMode = this.getOptions(['build', 'mode'], 'development');
   *
   * // Get with type safety
   * const port = this.getOptions<number>('port', 3000);
   *
   * // Get array option
   * const plugins = this.getOptions<string[]>('plugins', []);
   * ```
   */
  getOptions<T = unknown>(key?: string | string[], defaultValue?: T): T {
    if (!key) {
      return this.options as T;
    }

    return get(this.options, key, defaultValue);
  }
}
