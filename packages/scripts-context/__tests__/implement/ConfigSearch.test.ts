import { ConfigSearch } from '../../src/implement/ConfigSearch';
import { cosmiconfigSync } from 'cosmiconfig';
import fs from 'fs';
import path from 'path';

vi.mock('cosmiconfig', () => ({
  cosmiconfigSync: vi.fn()
}));

describe('ConfigSearch', () => {
  const testDir = './test-config';
  const testConfigPath = path.join(testDir, 'test.config.js');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should correctly initialize the config search instance', () => {
      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: { port: 3000 }
      });

      expect(configSearch.getSearchPlaces()).toContain('test.json');
      expect(configSearch.getSearchPlaces()).toContain('test.js');
    });

    it('should throw an error when name and searchPlaces are not provided', () => {
      // @ts-expect-error
      expect(() => new ConfigSearch({})).toThrow(
        'searchPlaces or name is required'
      );
    });
  });

  describe('search', () => {
    it('should return the merged config', () => {
      const mockConfig = { test: 'value' };
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({ config: mockConfig, filepath: testConfigPath }),
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: { port: 3000 }
      });

      const config = configSearch.config;
      expect(config).toEqual({
        test: 'value',
        port: 3000
      });
    });

    it('should cache the search result', () => {
      const mockConfig = { test: 'value' };
      const searchMock = vi.fn().mockReturnValue({
        config: mockConfig,
        filepath: testConfigPath
      });

      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: searchMock,
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({ name: 'test' });

      configSearch.search();
      configSearch.search();

      expect(searchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('get', () => {
    it('should return an empty object when file is false', () => {
      const configSearch = new ConfigSearch({ name: 'test' });
      const result = configSearch.get({ file: false });
      expect(result).toEqual({});
    });

    it('should throw an error when the configuration file is invalid', () => {
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        load: () => ({
          config: 'invalid string config' as unknown,
          filepath: testConfigPath
        })
      });

      const configSearch = new ConfigSearch({ name: 'test' });

      expect(() => configSearch.get({ file: testConfigPath })).toThrow(
        `Invalid configuration file at ${testConfigPath}`
      );
    });

    it('should use a custom loader', () => {
      type CustomLoader = (filepath: string) => Record<string, unknown>;
      const customLoader: CustomLoader = vi
        .fn()
        .mockReturnValue({ custom: 'value' });

      const configSearch = new ConfigSearch({
        name: 'test',
        loaders: {
          '.custom': customLoader
        }
      });

      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({
          config: { custom: 'value' },
          filepath: testConfigPath
        }),
        load: vi.fn()
      });

      configSearch.get();

      expect(cosmiconfigSync).toHaveBeenCalledWith('test', {
        searchPlaces: expect.any(Array),
        loaders: {
          '.custom': customLoader
        }
      });
    });

    it('should return empty object when config is not found', () => {
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => null,
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({ name: 'test' });
      const result = configSearch.get();

      expect(result).toEqual({});
    });

    it('should return empty object when config is not a plain object', () => {
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({
          config: ['array', 'config'],
          filepath: testConfigPath
        }),
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({ name: 'test' });
      const result = configSearch.get();

      expect(result).toEqual({});
    });

    it('should load from specific file path', () => {
      const loadMock = vi.fn().mockReturnValue({
        config: { loaded: 'from-file' },
        filepath: testConfigPath
      });

      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        load: loadMock,
        search: vi.fn()
      });

      const configSearch = new ConfigSearch({ name: 'test' });
      const result = configSearch.get({ file: testConfigPath });

      expect(loadMock).toHaveBeenCalledWith(testConfigPath);
      expect(result).toEqual({ loaded: 'from-file' });
    });

    it('should search in specific directory', () => {
      const searchMock = vi.fn().mockReturnValue({
        config: { searched: 'in-dir' },
        filepath: testConfigPath
      });

      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: searchMock,
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({ name: 'test' });
      const customDir = '/custom/dir';
      const result = configSearch.get({ dir: customDir });

      expect(searchMock).toHaveBeenCalledWith(customDir);
      expect(result).toEqual({ searched: 'in-dir' });
    });
  });

  describe('config property', () => {
    it('should merge default config with discovered config', () => {
      const mockConfig = { discovered: 'value' };
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({ config: mockConfig, filepath: testConfigPath }),
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: { default: 'value', port: 3000 }
      });

      const config = configSearch.config;
      expect(config).toEqual({
        discovered: 'value',
        default: 'value',
        port: 3000
      });
    });

    it('should prioritize discovered config over defaults', () => {
      const mockConfig = { port: 8080 };
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({ config: mockConfig, filepath: testConfigPath }),
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: { port: 3000 }
      });

      const config = configSearch.config;
      expect(config.port).toBe(8080);
    });

    it('should handle nested object merging', () => {
      const mockConfig = {
        server: { port: 8080 }
      };
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({ config: mockConfig, filepath: testConfigPath }),
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: {
          server: { port: 3000, host: 'localhost' },
          debug: false
        }
      });

      const config = configSearch.config;
      expect(config).toEqual({
        server: { port: 8080, host: 'localhost' },
        debug: false
      });
    });
  });

  describe('getSearchPlaces', () => {
    it('should return default search places when name is provided', () => {
      const configSearch = new ConfigSearch({ name: 'myapp' });
      const places = configSearch.getSearchPlaces();

      expect(places).toContain('package.json');
      expect(places).toContain('myapp.json');
      expect(places).toContain('myapp.js');
      expect(places).toContain('myapp.ts');
      expect(places).toContain('.myapp.json');
    });

    it('should return custom search places when provided', () => {
      const customPlaces = ['custom.config.js', 'config/app.js'];
      const configSearch = new ConfigSearch({
        name: 'test',
        searchPlaces: customPlaces
      });

      const places = configSearch.getSearchPlaces();
      expect(places).toEqual(customPlaces);
    });
  });

  describe('edge cases', () => {
    it('should handle null config result', () => {
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => null,
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: { default: 'value' }
      });

      const config = configSearch.config;
      expect(config).toEqual({ default: 'value' });
    });

    it('should handle undefined config result', () => {
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => undefined,
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({
        name: 'test',
        defaultConfig: { default: 'value' }
      });

      const config = configSearch.config;
      expect(config).toEqual({ default: 'value' });
    });

    it('should handle empty default config', () => {
      const mockConfig = { test: 'value' };
      (cosmiconfigSync as ReturnType<typeof vi.fn>).mockReturnValue({
        search: () => ({ config: mockConfig, filepath: testConfigPath }),
        load: vi.fn()
      });

      const configSearch = new ConfigSearch({ name: 'test' });
      const config = configSearch.config;

      expect(config).toEqual({ test: 'value' });
    });
  });
});
