import { cosmiconfigSync } from 'cosmiconfig';
import lodash from 'lodash';

function getDefaultSearchPlaces(name) {
  const exts = ['json', 'js', 'ts', 'cjs', 'yaml', 'yml'];
  return [
    'package.json',
    ...exts.map((ext) => `${name}.${ext}`),
    ...exts.map((ext) => `.${name}.${ext}`)
  ];
}

/**
 * Class representing a configuration search utility.
 *
 * This class is designed to facilitate the search and retrieval of configuration files
 * for a given application. It leverages the `cosmiconfig` library to perform the search
 * and supports various file extensions.
 *
 * The main purpose of this class is to provide a structured way to locate and load
 * configuration files, allowing for default configurations and custom loaders.
 *
 * Example usage:
 * ```javascript
 * const configSearch = new ConfigSearch({ name: 'myapp' });
 * const config = configSearch.config;
 * ```
 */
export class ConfigSearch {
  /**
   * Creates an instance of ConfigSearch.
   *
   * @param {Object} options - The options for configuration search.
   * @param {string} options.name - The base name of the configuration files to search for.
   * @param {string[]} [options.searchPlaces] - Custom search places for configuration files.
   * @param {Object} [options.defaultConfig] - Default configuration to use if no file is found.
   * @param {Object} [options.loaders] - Custom loaders for different file types.
   *
   * Throws an error if neither `name` nor `searchPlaces` is provided.
   */
  constructor({ name, searchPlaces, defaultConfig, loaders }) {
    if (!name && !searchPlaces) {
      throw new Error('searchPlaces or name is required');
    }

    this.name = name;
    this.searchPlaces = searchPlaces || getDefaultSearchPlaces(name);
    this._config = lodash.cloneDeep(defaultConfig);
    this.loaders = loaders;
  }

  /**
   * Retrieves the effective configuration by merging the found configuration
   * with the default configuration.
   *
   * @returns {import('@qlover/fe-scripts').FeConfig} The merged configuration object.
   */
  get config() {
    return lodash.defaultsDeep({}, this.search(), this._config);
  }

  /**
   * Returns the list of search places for configuration files.
   *
   * @returns {string[]} An array of search places.
   */
  getSearchPlaces() {
    return this.searchPlaces;
  }

  /**
   * Searches for a configuration file in the specified directory or file.
   *
   * @param {Object} options - The options for the search.
   * @param {string|boolean} [options.file] - The specific file to load, or false to skip file loading.
   * @param {string} [options.dir=process.cwd()] - The directory to search in.
   *
   * @returns {Object} The configuration object found, or an empty object if none is found.
   *
   * Throws an error if the configuration file is invalid.
   */
  get({ file, dir = process.cwd() }) {
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
    // debug({ cosmiconfig: result });
    return result && lodash.isPlainObject(result.config)
      ? result.config
      : localConfig;
  }

  /**
   * Searches for the configuration and caches the result.
   *
   * @returns {Object} The cached configuration object.
   */
  search() {
    if (this.searchCache) {
      return this.searchCache;
    }
    return (this.searchCache = this.get({}));
  }
}
