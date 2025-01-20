import { ConfigSearch, ConfigSearchOptions } from '../src/ConfigSearch';

describe('ConfigSearch', () => {
  const defaultOptions = {
    name: 'myapp',
    defaultConfig: { port: 3000, deepValue: { a: 1, b: 2 } }
  };

  it('should initialize with default options', () => {
    const configSearch = new ConfigSearch(defaultOptions);
    expect(configSearch.config).toEqual({
      port: 3000,
      deepValue: { a: 1, b: 2 }
    });
  });

  it('should throw an error if neither name nor searchPlaces is provided', () => {
    expect(() => new ConfigSearch({} as ConfigSearchOptions)).toThrow(
      'searchPlaces or name is required'
    );
  });

  it('should return default search places if none are provided', () => {
    const configSearch = new ConfigSearch(defaultOptions);
    const expectedPlaces = [
      'package.json',
      'myapp.json',
      'myapp.js',
      'myapp.ts',
      'myapp.cjs',
      'myapp.yaml',
      'myapp.yml',
      '.myapp.json',
      '.myapp.js',
      '.myapp.ts',
      '.myapp.cjs',
      '.myapp.yaml',
      '.myapp.yml'
    ];
    expect(configSearch.getSearchPlaces()).toEqual(expectedPlaces);
  });

  it('should merge default and discovered configurations', () => {
    const configSearch = new ConfigSearch({
      ...defaultOptions,
      defaultConfig: { port: 3000, debug: false }
    });
    jest.spyOn(configSearch, 'search').mockReturnValue({ debug: true });
    expect(configSearch.config).toEqual({ port: 3000, debug: true });
  });

  it('should merge default and discovered configurations (deep merge)', () => {
    const configSearch = new ConfigSearch({
      ...defaultOptions,
      defaultConfig: { port: 3000, deepValue: { a: 1, b: 2 } }
    });
    jest
      .spyOn(configSearch, 'search')
      .mockReturnValue({ deepValue: { b: 3, c: 4 } });
    expect(configSearch.config).toEqual({
      port: 3000,
      deepValue: { a: 1, b: 3, c: 4 }
    });
  });

  it('should return cached configuration on subsequent searches', () => {
    const configSearch = new ConfigSearch(defaultOptions);
    const searchSpy = jest
      .spyOn(configSearch, 'get')
      .mockReturnValue({ port: 4000 });
    const firstSearch = configSearch.search();
    const secondSearch = configSearch.search();
    expect(firstSearch).toEqual(secondSearch);
    expect(searchSpy).toHaveBeenCalledTimes(1);
  });

  it('should load configuration from a specific file', () => {
    const configSearch = new ConfigSearch(defaultOptions);
    jest.spyOn(configSearch, 'get').mockReturnValue({ port: 5000 });
    const config = configSearch.get({ file: 'custom.config.js' });
    expect(config).toEqual({ port: 5000 });
  });

  it('should return an empty object if file is set to false', () => {
    const configSearch = new ConfigSearch(defaultOptions);
    const config = configSearch.get({ file: false });
    expect(config).toEqual({});
  });
});
