import { cosmiconfigSync } from 'cosmiconfig';
import { cloneDeep, defaultsDeep, isPlainObject } from 'lodash';

/**
 * Configuration search options interface
 * @interface
 * @description
 * Significance: Defines the configuration structure for ConfigSearch initialization
 * Core idea: Centralize configuration search parameters
 * Main function: Type-safe configuration options
 * Main purpose: Standardize configuration initialization
 * Example:
 * ```typescript
 * const options: ConfigSearchOptions = {
 *   name: 'myapp',
 *   searchPlaces: ['myapp.config.js'],
 *   defaultConfig: { port: 3000 }
 * };
 * ```
 */
interface ConfigSearchOptions {
  /** Base name for configuration files */
  name: string;
  /** Custom search locations for config files */
  searchPlaces?: string[];
  /** Default configuration object */
  defaultConfig?: Record<string, unknown>;
  /** Custom loaders for different file types */
  loaders?: Record<string, (filepath: string) => unknown>;
}

/**
 * Search options interface for configuration retrieval
 * @interface
 * @description
 * Significance: Defines options for configuration search operation
 * Core idea: Control configuration file search behavior
 * Main function: Customize search parameters
 * Main purpose: Flexible configuration loading
 * Example:
 * ```typescript
 * const searchOptions: SearchOptions = {
 *   file: 'custom.config.js',
 *   dir: '/path/to/project'
 * };
 * ```
 */
interface SearchOptions {
  /** Specific configuration file to load */
  file?: string | false;
  /** Directory to search in */
  dir?: string;
}

/**
 * Utility function to generate default search locations
 * @param name - Base name for configuration files
 * @returns Array of default search locations
 * @description
 * Significance: Provides standard configuration file patterns
 * Core idea: Generate common configuration file patterns
 * Main function: Create search paths for different file types
 * Main purpose: Standardize configuration file discovery
 * Example:
 * ```typescript
 * const places = getDefaultSearchPlaces('myapp');
 * // ['package.json', 'myapp.json', 'myapp.js', ...]
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
 * Configuration search utility class
 * @class
 * @description
 * Significance: Manages configuration file discovery and loading
 * Core idea: Unified configuration management
 * Main function: Search and load configuration from various sources
 * Main purpose: Provide consistent configuration access
 * Example:
 * ```typescript
 * const configSearch = new ConfigSearch({
 *   name: 'myapp',
 *   defaultConfig: { port: 3000 }
 * });
 * const config = configSearch.config;
 * ```
 */
export class ConfigSearch {
  private name: string;
  private searchPlaces: string[];
  private _config: Record<string, unknown>;
  private loaders?: Record<string, (filepath: string) => unknown>;
  private searchCache?: Record<string, unknown>;

  /**
   * Creates a ConfigSearch instance
   * @param options - Configuration search options
   * @throws Error if neither name nor searchPlaces is provided
   * @description
   * Significance: Initializes configuration search environment
   * Core idea: Setup configuration search parameters
   * Main function: Create search instance with options
   * Main purpose: Prepare for configuration discovery
   * Example:
   * ```typescript
   * const search = new ConfigSearch({
   *   name: 'myapp',
   *   defaultConfig: { debug: true }
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
    this._config = cloneDeep(defaultConfig || {});
    this.loaders = loaders;
  }

  /**
   * Get effective configuration
   * @returns Merged configuration object
   * @description
   * Significance: Provides access to final configuration
   * Core idea: Merge default and discovered configurations
   * Main function: Retrieve effective configuration
   * Main purpose: Access complete configuration
   * Example:
   * ```typescript
   * const config = configSearch.config;
   * console.log(config.debug); // true
   * ```
   */
  get config(): Record<string, unknown> {
    return defaultsDeep({}, this.search(), this._config);
  }

  /**
   * Get search locations
   * @returns Array of search locations
   * @description
   * Significance: Exposes configuration search paths
   * Core idea: Provide transparency in search process
   * Main function: Return search locations
   * Main purpose: Debug and verify search paths
   * Example:
   * ```typescript
   * const places = configSearch.getSearchPlaces();
   * // ['package.json', 'myapp.config.js', ...]
   * ```
   */
  getSearchPlaces(): string[] {
    return this.searchPlaces;
  }

  /**
   * Get configuration from specific location
   * @param options - Search options
   * @returns Configuration object
   * @throws Error if configuration file is invalid
   * @description
   * Significance: Load configuration from specific location
   * Core idea: Flexible configuration loading
   * Main function: Load and validate configuration
   * Main purpose: Custom configuration loading
   * Example:
   * ```typescript
   * const config = configSearch.get({
   *   file: 'custom.config.js',
   *   dir: process.cwd()
   * });
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
   * Search for configuration with caching
   * @returns Cached configuration object
   * @description
   * Significance: Provides cached configuration access
   * Core idea: Cache configuration for performance
   * Main function: Search and cache configuration
   * Main purpose: Optimize repeated access
   * Example:
   * ```typescript
   * const config = configSearch.search();
   * // Subsequent calls use cached result
   * ```
   */
  search(): Record<string, unknown> {
    if (this.searchCache) {
      return this.searchCache;
    }
    return (this.searchCache = this.get({}));
  }
}
