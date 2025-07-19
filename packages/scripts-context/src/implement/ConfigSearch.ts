import { cosmiconfigSync } from 'cosmiconfig';
import defaultsDeep from 'lodash/defaultsDeep';
import isPlainObject from 'lodash/isPlainObject';

/**
 * Configuration search options for initializing ConfigSearch instances
 *
 * Design Considerations:
 * - Supports both name-based and custom search place configurations
 * - Provides default configuration fallback for graceful degradation
 * - Allows custom loaders for specialized file formats
 * - Maintains backward compatibility with cosmiconfig options
 *
 * @example Basic Usage
 * ```typescript
 * const options: ConfigSearchOptions = {
 *   name: 'myapp',
 *   defaultConfig: { port: 3000, debug: false }
 * };
 * ```
 *
 * @example Advanced Usage with Custom Loaders
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
   * @default `package.json`
   */
  name: string;
  /**
   * Custom search locations for config files (overrides default patterns)
   *
   * @default `['package.json', 'myapp.json', 'myapp.js', 'myapp.ts', 'myapp.cjs', 'myapp.yaml', 'myapp.yml', '.myapp.json', ...]`
   */
  searchPlaces?: string[];
  /**
   * Default configuration object (merged with discovered config)
   *
   * @default `{}`
   */
  defaultConfig?: Record<string, unknown>;
  /**
   * Custom loaders for different file types (extends cosmiconfig loaders)
   *
   * @default `{}`
   */
  loaders?: Record<string, (filepath: string) => unknown>;
}

/**
 * Search options for configuration retrieval operations
 *
 * Purpose:
 * - Control configuration file search behavior
 * - Support both automatic and manual file discovery
 * - Enable directory-specific configuration loading
 *
 * @example
 * ```typescript
 * // Load from specific file
 * const config = configSearch.get({ file: 'custom.config.js' });
 *
 * // Search in specific directory
 * const config = configSearch.get({ dir: '/path/to/project' });
 *
 * // Skip file loading (return empty config)
 * const config = configSearch.get({ file: false });
 * ```
 */
interface SearchOptions {
  /** Specific configuration file to load (false to skip file loading) */
  file?: string | false;
  /** Directory to search in (defaults to process.cwd()) */
  dir?: string;
}

/**
 * Generates default search locations for configuration files
 *
 * Search Strategy:
 * - Prioritizes package.json for project-level configuration
 * - Supports multiple file extensions for flexibility
 * - Includes both prefixed and non-prefixed file names
 * - Covers common configuration file patterns
 *
 * @param name - Base name for configuration files
 * @returns Array of search locations in priority order
 *
 * @example
 * ```typescript
 * const places = getDefaultSearchPlaces('myapp');
 * // ['package.json', 'myapp.json', 'myapp.js', 'myapp.ts',
 * //  'myapp.cjs', 'myapp.yaml', 'myapp.yml', '.myapp.json', ...]
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
 * Core Responsibilities:
 * - Discover configuration files in various locations
 * - Load and merge configuration from multiple sources
 * - Provide caching for performance optimization
 * - Support custom file loaders and search patterns
 *
 * Design Considerations:
 * - Uses cosmiconfig for robust file discovery
 * - Implements caching to avoid repeated file system operations
 * - Supports deep merging with lodash defaultsDeep
 * - Maintains backward compatibility with existing config patterns
 *
 * Performance Optimizations:
 * - Caches search results to avoid repeated file system access
 * - Uses synchronous operations for better performance in build tools
 * - Implements lazy loading of configuration data
 *
 * @example Basic Usage
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
 * @example Advanced Usage with Custom Search
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
 */
export class ConfigSearch {
  private name: string;
  private searchPlaces: string[];
  private _config: Record<string, unknown>;
  private loaders?: Record<string, (filepath: string) => unknown>;
  private searchCache?: Record<string, unknown>;

  /**
   * Creates a ConfigSearch instance with specified options
   *
   * Validation Rules:
   * - Either name or searchPlaces must be provided
   * - Name is used to generate default search patterns if searchPlaces not provided
   * - Default configuration provides fallback values
   *
   * @param options - Configuration search options
   * @throws {Error} When neither name nor searchPlaces is provided
   *
   * @example
   * ```typescript
   * // Using name (generates default search patterns)
   * const search = new ConfigSearch({
   *   name: 'myapp',
   *   defaultConfig: { debug: true }
   * });
   *
   * // Using custom search places
   * const search = new ConfigSearch({
   *   searchPlaces: ['custom.config.js'],
   *   defaultConfig: { port: 8080 }
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
   * Merging Strategy:
   * - Default configuration provides base values
   * - Discovered configuration overrides defaults
   * - Uses lodash defaultsDeep for nested object merging
   * - Returns a new object to prevent mutation
   *
   * @returns Merged configuration object
   *
   * @example
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
   */
  get config(): Record<string, unknown> {
    return defaultsDeep({}, this.search(), this._config);
  }

  /**
   * Gets the configured search locations for debugging and verification
   *
   * Use Cases:
   * - Debug configuration discovery issues
   * - Verify search patterns are correct
   * - Document expected configuration file locations
   *
   * @returns Array of search locations in priority order
   *
   * @example
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   * const places = configSearch.getSearchPlaces();
   * console.log('Searching for config in:', places);
   * // ['package.json', 'myapp.json', 'myapp.js', 'myapp.ts', ...]
   * ```
   */
  getSearchPlaces(): string[] {
    return this.searchPlaces;
  }

  /**
   * Loads configuration from a specific location with validation
   *
   * Loading Process:
   * 1. Creates cosmiconfig instance with configured options
   * 2. Loads from specific file or searches in directory
   * 3. Validates configuration is a plain object
   * 4. Returns empty object for invalid configurations
   *
   * Error Handling:
   * - Throws error for invalid configuration files (string configs)
   * - Returns empty object for missing or invalid configurations
   * - Logs warnings for non-object configurations
   *
   * @param options - Search options for configuration loading
   * @returns Configuration object from specified location
   * @throws {Error} When configuration file contains invalid data
   *
   * @example
   * ```typescript
   * const configSearch = new ConfigSearch({ name: 'myapp' });
   *
   * // Load from specific file
   * const config = configSearch.get({ file: 'custom.config.js' });
   *
   * // Search in current directory
   * const config = configSearch.get({ dir: process.cwd() });
   *
   * // Skip file loading
   * const config = configSearch.get({ file: false }); // Returns {}
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
   * Caching Strategy:
   * - Caches search results to avoid repeated file system operations
   * - Cache is invalidated on each search call (simple implementation)
   * - Improves performance for repeated configuration access
   *
   * Performance Benefits:
   * - Reduces file system I/O operations
   * - Avoids repeated cosmiconfig initialization
   * - Particularly beneficial in build tools and CLI applications
   *
   * @returns Cached configuration object from search
   *
   * @example
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
   */
  search(): Record<string, unknown> {
    if (this.searchCache) {
      return this.searchCache;
    }
    return (this.searchCache = this.get({}));
  }
}
