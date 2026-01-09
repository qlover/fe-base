import type { ScriptSharedInterface } from '../interface/ScriptSharedInterface';
import type { LoggerInterface } from '@qlover/logger';
import type { FeConfig } from '../feConfig';
import { merge, get } from 'lodash-es';
import { Env } from '@qlover/env-loader';

/**
 * Default environment file loading order
 */
const DEFAULT_ENV_ORDER = ['.env.local', '.env'];

/**
 * Applies default values to script options with environment integration
 *
 * Core concept:
 * Enhances provided options with sensible defaults and environment variable
 * integration, ensuring all required configuration is available.
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
 * @param feConfig - Fe configuration object
 * @param logger - Logger instance for environment loading
 * @returns Options with default values and environment integration
 *
 * @example Basic defaults
 * ```typescript
 * const options = getDefaultOptions({}, feConfig, logger);
 * // Returns: { rootPath: process.cwd(), sourceBranch: 'master', env: Env instance }
 * ```
 *
 * @example With environment variables
 * ```typescript
 * // If FE_RELEASE_BRANCH=develop
 * const options = getDefaultOptions({}, feConfig, logger);
 * // Returns: { rootPath: process.cwd(), sourceBranch: 'develop', env: Env instance }
 * ```
 */
export function getDefaultOptions<Opt extends ScriptSharedInterface>(
  options: Opt,
  feConfig: FeConfig,
  logger: LoggerInterface
): Opt {
  const env =
    options.env ||
    Env.searchEnv({
      logger: logger,
      preloadList: feConfig.envOrder || DEFAULT_ENV_ORDER
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
 * Extracts script-specific configuration from configuration sources
 *
 * Core concept:
 * Retrieves configuration for a specific script from a configuration
 * object, supporting both direct access and nested path access with
 * validation and error handling.
 *
 * Extraction process:
 * 1. Uses lodash get for nested path access
 * 2. Validates extracted value is a plain object
 * 3. Warns if non-object value found
 * 4. Returns empty object as fallback for invalid values
 * 5. Maintains type safety through generic constraints
 *
 * Path handling:
 * - String: Direct property access (e.g., 'build-script')
 * - Array: Nested path access (e.g., ['scripts', 'build'])
 * - Empty: Returns entire sources object
 * - Invalid: Returns empty object with warning
 *
 * Validation rules:
 * - Configuration must be a plain object
 * - Non-object values trigger warning
 * - Null and undefined are treated as invalid
 * - Arrays and primitives are rejected
 * - Empty object returned for invalid configurations
 *
 * @param scriptName - Script name or array of names for nested access
 * @param sources - Configuration sources object
 * @param logger - Logger instance for warnings
 * @returns Script-specific configuration or empty object
 *
 * @example Basic extraction
 * ```typescript
 * const config = getDefaultStore('build-script', {
 *   'build-script': { target: 'production' }
 * }, logger);
 * // Returns: { target: 'production' }
 * ```
 *
 * @example Nested path extraction
 * ```typescript
 * const config = getDefaultStore(['scripts', 'build'], {
 *   scripts: { build: { target: 'production' } }
 * }, logger);
 * // Returns: { target: 'production' }
 * ```
 *
 * @example Invalid configuration
 * ```typescript
 * const config = getDefaultStore('build-script', {
 *   'build-script': 'invalid string'
 * }, logger);
 * // Logs warning and returns: {}
 * ```
 */
export function getDefaultStore<Opt extends ScriptSharedInterface>(
  scriptName: string | string[],
  sources: FeConfig,
  logger: LoggerInterface
): Opt {
  const rootProp = scriptName ? get(sources, scriptName) : sources;
  const isObject = typeof rootProp === 'object' && rootProp !== null;
  const rootPropObject = isObject ? rootProp : {};
  if (!isObject) {
    logger.warn(
      `rootProp ${scriptName} is not an object, it will be overwritten by the default options`
    );
  }

  return rootPropObject as Opt;
}

/**
 * Initializes script options with configuration extraction and default values
 *
 * Core concept:
 * Combines configuration extraction from feConfig and default option application
 * into a single operation, providing a fully initialized options object ready
 * for use in script contexts.
 *
 * Initialization process:
 * 1. Extracts script-specific configuration from feConfig using getDefaultStore
 * 2. Applies default values and environment integration using getDefaultOptions
 * 3. Merges both results into a single options object
 * 4. Returns fully initialized options with all defaults applied
 *
 * This function combines:
 * - Configuration extraction (getDefaultStore)
 * - Default value application (getDefaultOptions)
 * - Deep merging of both results
 *
 * Benefits:
 * - Single function call for complete initialization
 * - Consistent initialization logic across contexts
 * - Reduces boilerplate code in constructors
 * - Maintains type safety throughout
 *
 * @param scriptName - Script name or array of names for nested access
 * @param feConfig - Fe configuration object
 * @param options - Partial options to merge with defaults
 * @param logger - Logger instance for warnings and environment loading
 * @returns Fully initialized options with configuration and defaults
 *
 * @example Basic usage
 * ```typescript
 * const options = initializeOptions('build-script', feConfig, {}, logger);
 * // Returns fully initialized options with:
 * // - Configuration from feConfig['build-script']
 * // - Default values (rootPath, sourceBranch, env)
 * // - Environment variable integration
 * ```
 *
 * @example With partial options
 * ```typescript
 * const options = initializeOptions(
 *   'deploy-script',
 *   feConfig,
 *   { verbose: true, customOption: 'value' },
 *   logger
 * );
 * // Returns merged options with custom values preserved
 * ```
 */
export function initializeOptions<Opt extends ScriptSharedInterface>(
  scriptName: string | string[],
  feConfig: FeConfig,
  options: Opt,
  logger: LoggerInterface
): Opt {
  // Extract configuration from feConfig
  const store = getDefaultStore<Opt>(scriptName, feConfig, logger);

  // Merge store with provided options
  const mergedOptions = merge({}, store, options);

  // Apply default values and environment integration
  const defaultOptions = getDefaultOptions<Opt>(
    mergedOptions,
    feConfig,
    logger
  );

  return defaultOptions;
}
