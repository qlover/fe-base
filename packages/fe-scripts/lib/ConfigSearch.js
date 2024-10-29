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

export class ConfigSearch {
  constructor({ name, searchPlaces, defaultConfig, loaders }) {
    if (!name && !searchPlaces) {
      throw new Error('searchPlaces or name is required');
    }

    this.name = name;
    this.searchPlaces = searchPlaces || getDefaultSearchPlaces(name);
    this._config = lodash.cloneDeep(defaultConfig);
    this.loaders = loaders;
  }

  get config() {
    return lodash.defaultsDeep({}, this.search(), this._config);
  }

  getSearchPlaces() {
    return this.searchPlaces;
  }

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

  search() {
    if (this.searchCache) {
      return this.searchCache;
    }
    return (this.searchCache = this.get({}));
  }
}
