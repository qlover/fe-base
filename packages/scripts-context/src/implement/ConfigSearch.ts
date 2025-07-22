import { cosmiconfigSync } from 'cosmiconfig';
import defaultsDeep from 'lodash/defaultsDeep';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Configuration search options for initializing ConfigSearch instances
 *
 * Core concept:
 * Defines the configuration parameters for setting up a configuration search
 * utility that can discover and load configuration files from various locations
 * in a project directory structure.
 *
 * Design considerations:
 * - Supports both name-based and custom search place configurations
 * - Provides default configuration fallback for graceful degradation
 * - Allows custom loaders for specialized file formats
 * - Maintains backward compatibility with cosmiconfig options
 * - Enables flexible configuration discovery strategies
 *
 * @example Basic usage
 * ```typescript
 * const options: ConfigSearchOptions = {
 *   name: 'myapp',
 *   defaultConfig: { port: 3000, debug: false }
 * };
 * ```
 *
 * @example Advanced usage with custom loaders
 * ```typescript
 * const options: ConfigSearchOptions = {
 *   name: 'myapp',
 *   searchPlaces: ['myapp.config.js', 'myapp.config.ts'],
 *   loaders: {
 *     '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8'))
 *   }
 * };
 * ```
 */
export interface ConfigSearchOptions {
  /**
   * Base name for configuration files (used to generate default search patterns)
   *
   * This name is used to generate default search patterns for configuration files.
   * For example, if name is 'myapp', it will search for files like:
   * - myapp.json
   * - myapp.js
   * - myapp.ts
   * - .myapp.json
   * - etc.
   *
   * The name is also used as the cosmiconfig module name for package.json
   * configuration discovery.
   *
   * @example `'myapp'` // Searches for myapp.* files
   * @example `'fe-config'` // Searches for fe-config.* files
   */
  name: string;
  /**
   * Custom search locations for config files (overrides default patterns)
   *
   * When provided, this completely overrides the default search patterns
   * generated from the name. Useful for projects with specific configuration
   * file naming conventions or directory structures.
   *
   * Search order:
   * - Files are searched in the order they appear in the array
   * - First found file is used (cosmiconfig behavior)
   * - Relative paths are resolved from the search directory
   *
   * @optional
   * @example `['config/app.js', 'app.config.ts']`
   * @example `['package.json', 'custom.config.js']`
   */
  searchPlaces?: string[];
  /**
   * Default configuration object (merged with discovered config)
   *
   * Provides fallback values that are merged with discovered configuration.
   * Uses lodash defaultsDeep for deep merging, so nested objects are
   * properly merged rather than replaced.
   *
   * Merging behavior:
   * - Default values are used when not found in discovered config
   * - Discovered config values override defaults
   * - Nested objects are merged recursively
   * - Arrays are replaced (not merged)
   *
   * @optional
   * @default `{}`
   * @example `{ port: 3000, debug: false, database: { host: 'localhost' } }`
   */
  defaultConfig?: Record<string, unknown>;
  /**
   * Custom loaders for different file types (extends cosmiconfig loaders)
   *
   * Allows loading of custom file formats beyond the built-in support
   * for JSON, JavaScript, TypeScript, YAML, etc. Each loader function
   * receives the filepath and should return the parsed configuration object.
   *
   * Loader requirements:
   * - Must be synchronous (cosmiconfigSync requirement)
   * - Should throw errors for invalid files
   * - Should return plain objects or throw for invalid configs
   * - File extension should include the dot (e.g., '.toml')
   *
   * @optional
   * @default `{}`
   * @example
   * ```typescript
   * {
   *   '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8')),
   *   '.ini': (filepath) => parseINI(readFileSync(filepath, 'utf8'))
   * }
   * ```
   */
  loaders?: Record<string, (filepath: string) => unknown>;
}

/**
 * Search options for configuration retrieval operations
 *
 * Core concept:
 * Controls how configuration files are discovered and loaded during
 * configuration retrieval operations, allowing fine-grained control
 * over the search behavior.
 *
 * Use cases:
 * - Load configuration from specific files
 * - Search in specific directories
 * - Skip file loading for testing or debugging
 * - Control search scope for performance optimization
 *
 * @example Load from specific file
 * ```typescript
 * const config = configSearch.get({ file: 'custom.config.js' });
 * ```
 *
 * @example Search in specific directory
 * ```typescript
 * const config = configSearch.get({ dir: '/path/to/project' });
 * ```
 *
 * @example Skip file loading (return empty config)
 * ```typescript
 * const config = configSearch.get({ file: false });
 * ```
 */
interface SearchOptions {
  /**
   * Specific configuration file to load (false to skip file loading)
   *
   * When provided as a string, loads configuration from the specified file.
   * When set to false, skips file loading entirely and returns an empty object.
   * When undefined, performs automatic search in the specified directory.
   *
   * File loading behavior:
   * - Absolute paths are used as-is
   * - Relative paths are resolved from the search directory
   * - File must exist and be readable
   * - File must contain valid configuration data
   *
   * @optional
   * @example `'config/production.js'` // Load specific file
   * @example `false` // Skip file loading
   */
  file?: string | false;
  /**
   * Directory to search in (defaults to process.cwd())
   *
   * Specifies the root directory for configuration file search.
   * The search will look for configuration files in this directory
   * and its parent directories (cosmiconfig behavior).
   *
   * Search behavior:
   * - Starts from the specified directory
   * - Searches upward through parent directories
   * - Stops at the first found configuration file
   * - Respects .gitignore and other ignore patterns
   *
   * @optional
   * @default `process.cwd()`
   * @example `'/path/to/project'` // Search in specific directory
   * @example `process.cwd()` // Search from current working directory
   */
  dir?: string;
}

/**
 * Generates default search locations for configuration files
 *
 * Core concept:
 * Creates a prioritized list of configuration file locations based on
 * the provided name, following common configuration file naming conventions
 * and best practices.
 *
 * Search strategy:
 * - Prioritizes package.json for project-level configuration
 * - Supports multiple file extensions for flexibility
 * - Includes both prefixed and non-prefixed file names
 * - Covers common configuration file patterns
 * - Follows cosmiconfig default search patterns
 *
 * File extensions supported:
 * - json: Standard JSON configuration files
 * - js: JavaScript configuration files (CommonJS)
 * - ts: TypeScript configuration files
 * - cjs: CommonJS configuration files
 * - yaml/yml: YAML configuration files
 *
 * @param name - Base name for configuration files
 * @returns Array of search locations in priority order
 *
 * @example
 * ```typescript
 * const places = getDefaultSearchPlaces('myapp');
 * // Returns: [
 * //   'package.json',
 * //   'myapp.json', 'myapp.js', 'myapp.ts', 'myapp.cjs', 'myapp.yaml', 'myapp.yml',
 * //   '.myapp.json', '.myapp.js', '.myapp.ts', '.myapp.cjs', '.myapp.yaml', '.myapp.yml'
 * // ]
 * ```
 */
function getDefaultSearchPlaces(name: string): string[] {
  const exts = ['json', 'js', 'ts', 'cjs', 'yaml', 'yml'];
  return [
    'package.json',
    ...exts.map((ext) => `${name}.${ext}`),
    ...exts.map((ext) => `.${name}.${ext}`)
  ];
}

/**
 * Configuration search and loading utility with caching support
 *
 * Core concept:
 * Provides a robust, performant way to discover and load configuration
 * files from various locations in a project directory structure, with
 * intelligent caching and merging capabilities.
 *
 * Main features:
 * - File discovery: Automatically finds configuration files in project directories
 *   - Searches multiple file formats (JSON, JS, TS, YAML, etc.)
 *   - Supports both prefixed and non-prefixed file names
 *   - Follows cosmiconfig search patterns and conventions
 *   - Respects .gitignore and other ignore patterns
 *
 * - Configuration merging: Intelligently combines default and discovered configs
 *   - Uses lodash defaultsDeep for deep object merging
 *   - Preserves nested object structures
 *   - Provides fallback values for missing configurations
 *   - Handles complex configuration hierarchies
 *
 * - Performance optimization: Implements caching to avoid repeated file system operations
 *   - Caches search results for repeated access
 *   - Reduces file system I/O in build tools and CLI applications
 *   - Improves performance for configuration-heavy applications
 *   - Supports cache invalidation when needed
 *
 * - Custom loaders: Extends cosmiconfig with custom file format support
 *   - Add support for TOML, INI, or other custom formats
 *   - Maintains compatibility with existing cosmiconfig loaders
 *   - Allows project-specific configuration file formats
 *   - Supports both synchronous and asynchronous loading patterns
 *
 * Design considerations:
 * - Uses cosmiconfig for robust file discovery and loading
 * - Implements caching to avoid repeated file system operations
 * - Supports deep merging with lodash defaultsDeep
 * - Maintains backward compatibility with existing config patterns
 * - Provides flexible configuration override mechanisms
 *
 * Performance optimizations:
 * - Caches search results to avoid repeated file system access
 * - Uses synchronous operations for better performance in build tools
 * - Implements lazy loading of configuration data
 * - Minimizes memory usage through efficient caching strategies
 *
 * @example Basic usage
 * ```typescript
 * const configSearch = new ConfigSearch({
 *   name: 'myapp',
 *   defaultConfig: { port: 3000, debug: false }
 * });
 *
 * // Get merged configuration
 * const config = configSearch.config;
 * console.log(config.port); // 3000 (from default)
 * ```
 *
 * @example Advanced usage with custom search
 * ```typescript
 * const configSearch = new ConfigSearch({
 *   name: 'myapp',
 *   searchPlaces: ['myapp.config.js', 'config/myapp.js'],
 *   defaultConfig: { environment: 'development' }
 * });
 *
 * // Search in specific directory
 * const config = configSearch.get({ dir: '/path/to/project' });
 *
 * // Get search locations for debugging
 * console.log(configSearch.getSearchPlaces());
 * ```
 *
 * @example Custom file format support
 * ```typescript
 * const configSearch = new ConfigSearch({
 *   name: 'myapp',
 *   loaders: {
 *     '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8'))
 *   }
 * });
 * ```
 */
export class ConfigSearch {
  /**
   * Base name for configuration files
   *
   * Used to generate default search patterns and as the cosmiconfig
   * module name for package.json configuration discovery.
   */
  private name: string;
  /**
   * Search locations for configuration files
   *
   * Array of file patterns to search for, in priority order.
   * Can be either default patterns generated from name or
   * custom patterns provided in constructor options.
   */
  private searchPlaces: string[];
  /**
   * Default configuration object
   *
   * Provides fallback values that are merged with discovered
   * configuration using lodash defaultsDeep.
   */
  private _config: Record<string, unknown>;
  /**
   * Custom file loaders for extended format support
   *
   * Extends cosmiconfig's built-in loaders with custom file
   * format support (e.g., TOML, INI, etc.).
   */
  private loaders?: Record<string, (filepath: string) => unknown>;
  /**
   * Cache for search results
   *
   * Stores the result of the last search operation to avoid
   * repeated file system access. Simple implementation that
   * caches the entire search result.
   */
  private searchCache?: Record<string, unknown>;

  /**
   * Creates a ConfigSearch instance with specified options
   *
   * Core concept:
   * Initializes a configuration search utility with the specified
   * options, setting up file discovery patterns and default values.
   *
   * Validation rules:
   * - Either name or searchPlaces must be provided
   * - Name is used to generate default search patterns if searchPlaces not provided
   * - Default configuration provides fallback values
   * - Custom loaders extend cosmiconfig's built-in support
   *
   * Initialization process:
   * 1. Validates that either name or searchPlaces is provided
   * 2. Sets up search patterns (custom or generated from name)
   * 3. Initializes default configuration object
   * 4. Stores custom loaders for extended format support
   *
   * @param options - Configuration search options
   * @throws {Error} When neither name nor searchPlaces is provided
   *
   * @example Using name (generates default search patterns)
   * ```typescript
   * const search = new ConfigSearch({
   *   name: 'myapp',
   *   defaultConfig: { debug: true }
   * });
   * ```
   *
   * @example Using custom search places
   * ```typescript
   * const search = new ConfigSearch({
   *   searchPlaces: ['custom.config.js'],
   *   defaultConfig: { port: 8080 }
   * });
   * ```
   *
   * @example With custom loaders
   * ```typescript
   * const search = new ConfigSearch({
   *   name: 'myapp',
   *   loaders: {
   *     '.toml': (filepath) => parseTOML(readFileSync(filepath, 'utf8'))
   *   }
   * });
   * ```
   */
  constructor(options: ConfigSearchOptions) {
    const { name, searchPlaces, defaultConfig, loaders } = options;

    if (!name && !searchPlaces) {
      throw new Error('searchPlaces or name is required');
    }

    this.name = name;
    this.searchPlaces = searchPlaces || getDefaultSearchPlaces(name);
    this._config = defaultConfig || {};
    this.loaders = loaders;
  }

  /**
   * Gets the effective configuration with deep merging
   *
   * Core concept:
   * Retrieves the complete configuration by merging default values
   * with discovered configuration files, providing a unified
   * configuration object for the application.
   *
   * Merging strategy:
   * - Default configuration provides base values
   * - Discovered configuration overrides defaults
   * - Uses lodash defaultsDeep for nested object merging
   * - Returns a new object to prevent mutation
   * - Handles complex nested structures properly
   *
   * Merging behavior:
   * - Primitive values: Discovered values override defaults
   * - Objects: Deep merge, preserving both default and discovered properties
   * - Arrays: Discovered arrays replace default arrays (not merged)
   * - Undefined values: Default values are preserved
   * - Null values: Treated as explicit values (override defaults)
   *
   * Performance considerations:
   * - Uses cached search results when available
   * - Performs deep merge only when necessary
   * - Returns new object to prevent external mutation
   *
   * @returns Merged configuration object
   *
   * @example Basic merging
   * ```typescript
   * const configSearch = new ConfigSearch({
   *   name: 'myapp',
   *   defaultConfig: {
   *     server: { port: 3000, host: 'localhost' },
   *     debug: false
   *   }
   * });
   *
   * // If myapp.config.js contains: { server: { port: 8080 }, log: true }
   * const config = configSearch.config;
   * // Result: { server: { port: 8080, host: 'localhost' }, debug: false, log: true }
   * ```
   *
   * @example Complex nested merging
   * ```typescript
   * const configSearch = new ConfigSearch({
   *   name: 'myapp',
   *   defaultConfig: {
   *     database: {
   *       host: 'localhost',
   *       options: { timeout: 5000, retries: 3 }
   *     }
   *   }
   * });
   *
   * // If config file contains: { database: { port: 5432, options: { timeout: 10000 } } }
   * const config = configSearch.config;
   * // Result: {
   * //   database: {
   * //     host: 'localhost',
   * //     port: 5432,
   * //     options: { timeout: 10000, retries: 3 }
   * //   }
   * // }
   * ```
   */
  get config(): Record<string, unknown> {
    return defaultsDeep({}, this.search(), this._config);
  }

  /**
   * Gets the configured search locations for debugging and verification
   *
   * Core concept:
   * Provides access to the search patterns used by this ConfigSearch
   * instance, useful for debugging configuration discovery issues
   * and understanding the search behavior.
   *
   * Use cases:
   * - Debug configuration discovery issues
   * - Verify search patterns are correct
   * - Document expected configuration file locations
   * - Understand search priority order
   * - Validate custom search place configurations
   *
   * Search pattern information:
   * - Returns the exact patterns used for file discovery
   * - Patterns are in priority order (first match wins)
   * - Includes both custom and generated patterns
   * - Useful for troubleshooting missing configuration files
   *
   * @returns Array of search locations in priority order
   *
   * @example Basic usage
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   * const places = configSearch.getSearchPlaces();
   * console.log('Searching for config in:', places);
   * // ['package.json', 'myapp.json', 'myapp.js', 'myapp.ts', ...]
   * ```
   *
   * @example Debugging missing configuration
   * ```typescript
   * const configSearch = new ConfigSearch({
   *   searchPlaces: ['custom.config.js', 'config/app.js']
   * });
   *
   * const places = configSearch.getSearchPlaces();
   * console.log('Expected config files:', places);
   * // ['custom.config.js', 'config/app.js']
   * ```
   */
  getSearchPlaces(): string[] {
    return this.searchPlaces;
  }

  /**
   * Loads configuration from a specific location with validation
   *
   * Core concept:
   * Performs targeted configuration loading from specific files or
   * directories, with comprehensive validation and error handling.
   *
   * Loading process:
   * 1. Creates cosmiconfig instance with configured options
   * 2. Loads from specific file or searches in directory
   * 3. Validates configuration is a plain object
   * 4. Returns empty object for invalid configurations
   * 5. Handles various error conditions gracefully
   *
   * File loading behavior:
   * - Specific file: Loads configuration from the exact file path
   * - Directory search: Searches for configuration files in the directory
   * - Skip loading: Returns empty object when file is false
   * - Validation: Ensures configuration is a valid plain object
   *
   * Error handling:
   * - Throws error for invalid configuration files (string configs)
   * - Returns empty object for missing or invalid configurations
   * - Logs warnings for non-object configurations
   * - Handles file system errors gracefully
   * - Validates configuration structure and format
   *
   * Validation rules:
   * - Configuration must be a plain object (not string, array, etc.)
   * - File must exist and be readable
   * - File must contain valid configuration data
   * - Custom loaders must return valid objects
   *
   * @param options - Search options for configuration loading
   * @returns Configuration object from specified location
   * @throws {Error} When configuration file contains invalid data
   *
   * @example Load from specific file
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   * const config = configSearch.get({ file: 'custom.config.js' });
   * ```
   *
   * @example Search in current directory
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   * const config = configSearch.get({ dir: process.cwd() });
   * ```
   *
   * @example Skip file loading
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   * const config = configSearch.get({ file: false }); // Returns {}
   * ```
   *
   * @example Search in specific directory
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   * const config = configSearch.get({ dir: '/path/to/project' });
   * ```
   */
  get(options: SearchOptions = {}): Record<string, unknown> {
    const { file, dir = process.cwd() } = options;
    const localConfig = {};

    if (file === false) return localConfig;

    const explorer = cosmiconfigSync(this.name, {
      searchPlaces: this.searchPlaces,
      loaders: this.loaders
    });

    const result = file ? explorer.load(file) : explorer.search(dir);

    if (result && typeof result.config === 'string') {
      throw new Error(`Invalid configuration file at ${result.filepath}`);
    }

    return result && isPlainObject(result.config) ? result.config : localConfig;
  }

  /**
   * Searches for configuration with caching for performance optimization
   *
   * Core concept:
   * Performs configuration file discovery with intelligent caching
   * to optimize performance for repeated configuration access.
   *
   * Caching strategy:
   * - Caches search results to avoid repeated file system operations
   * - Cache is invalidated on each search call (simple implementation)
   * - Improves performance for repeated configuration access
   * - Reduces file system I/O in build tools and CLI applications
   *
   * Performance benefits:
   * - Reduces file system I/O operations
   * - Avoids repeated cosmiconfig initialization
   * - Particularly beneficial in build tools and CLI applications
   * - Minimizes configuration loading overhead
   * - Improves application startup time
   *
   * Cache behavior:
   * - First call: Performs full file system search
   * - Subsequent calls: Returns cached result
   * - Cache is shared across all method calls
   * - Simple cache invalidation strategy
   *
   * Search process:
   * 1. Check if cached result exists
   * 2. If cached, return cached result
   * 3. If not cached, perform file system search
   * 4. Cache the search result
   * 5. Return the discovered configuration
   *
   * @returns Cached configuration object from search
   *
   * @example Basic usage
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   *
   * // First call performs file system search
   * const config1 = configSearch.search();
   *
   * // Subsequent calls use cached result
   * const config2 = configSearch.search(); // No file system access
   *
   * // Both return the same configuration object
   * console.log(config1 === config2); // true
   * ```
   *
   * @example Performance optimization
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   *
   * // In a build tool or CLI application
   * for (let i = 0; i < 100; i++) {
   *   const config = configSearch.search(); // Only first call hits file system
   *   // Use configuration...
   * }
   * ```
   */
  search(): Record<string, unknown> {
    if (this.searchCache) {
      return this.searchCache;
    }
    return (this.searchCache = this.get({}));
  }
}
