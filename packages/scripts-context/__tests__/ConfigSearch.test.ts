import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigSearch } from '../src/ConfigSearch';
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
  });
});
