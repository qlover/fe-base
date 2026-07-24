import { Env } from '../src';
import type { LoggerInterface } from '@qlover/logger';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve, normalize } from 'path';

vi.mock('dotenv');
vi.mock('node:fs');

function toLocalPath(pathstring: string): string {
  return normalize(resolve(pathstring));
}

describe('Env', () => {
  let logger: LoggerInterface;

  beforeEach(() => {
    logger = {
      fatal: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
      trace: vi.fn(),
      log: vi.fn(),
      child: vi.fn(),
      use: vi.fn(),
      addAppender: vi.fn(),
      context: {}
    } as unknown as LoggerInterface;
  });

  describe('constructor', () => {
    it('should initialize with given options', () => {
      const env = new Env({ rootPath: '/test/path', logger });
      expect(env.rootPath).toBe('/test/path');
      expect(env.logger).toBe(logger);
    });

    it('should initialize with default logger if none provided', () => {
      const env = new Env({ rootPath: '/test/path' });
      expect(env.logger).toBeUndefined();
    });
  });

  describe('load', () => {
    it('should load environment variables from files', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({ preloadList: ['.env'] });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({ path: toLocalPath('/test/path/.env') })
      );
      expect(logger.debug).toHaveBeenCalledWith(
        `Loaded \`${toLocalPath('/test/path/.env')}\` file`
      );
    });

    it('should warn if no .env file is found', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({ preloadList: ['.env'] });

      expect(logger.warn).toHaveBeenCalledWith('No .env file found');
    });

    it('should warn if preloadList is empty', () => {
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({ preloadList: [] });

      expect(logger.warn).toHaveBeenCalledWith(
        'Env load preloadList is empty!'
      );
    });

    it('should prepend .env.<value> when envVar is set', () => {
      process.env.APP_ENV = 'staging';
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) => path.includes('.env.staging')
      );
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({
        preloadList: ['.env.local', '.env'],
        envVar: 'APP_ENV'
      });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({
          path: toLocalPath('/test/path/.env.staging')
        })
      );

      delete process.env.APP_ENV;
    });

    it('should keep preloadList when envVar is unset', () => {
      delete process.env.APP_ENV;
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) => path.endsWith('.env.local')
      );
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({
        preloadList: ['.env.local', '.env'],
        envVar: 'APP_ENV'
      });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({
          path: toLocalPath('/test/path/.env.local')
        })
      );
    });

    it('should dedupe preferred file already in preloadList', () => {
      process.env.APP_ENV = 'local';
      vi.mocked(config).mockClear();
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({
        preloadList: ['.env.local', '.env'],
        envVar: 'APP_ENV'
      });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({
          path: toLocalPath('/test/path/.env.local')
        })
      );
      expect(config).toHaveBeenCalledTimes(1);

      delete process.env.APP_ENV;
    });

    it('should forward dotenv options such as encoding and override', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({
        preloadList: ['.env'],
        encoding: 'latin1',
        override: true,
        debug: true
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env'),
        encoding: 'latin1',
        override: true,
        debug: true
      });
    });

    it('should fall back to the next file when the first is missing', () => {
      vi.mocked(config).mockClear();
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) => String(path).endsWith(`${normalize('/.env')}`)
      );
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({ preloadList: ['.env.local', '.env'] });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({
          path: toLocalPath('/test/path/.env')
        })
      );
      expect(config).toHaveBeenCalledTimes(1);
    });

    it('should prefer options.rootPath over instance rootPath', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = new Env({ rootPath: '/instance/path', logger });
      env.load({
        preloadList: ['.env'],
        rootPath: '/override/path'
      });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({
          path: toLocalPath('/override/path/.env')
        })
      );
    });

    it('should ignore empty envVar value', () => {
      process.env.APP_ENV = '';
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({
        preloadList: ['.env.local', '.env'],
        envVar: 'APP_ENV'
      });

      expect(config).toHaveBeenCalledWith(
        expect.objectContaining({
          path: toLocalPath('/test/path/.env.local')
        })
      );

      delete process.env.APP_ENV;
    });

    it('should forward processEnv and quiet to dotenv', () => {
      const processEnv = {};
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = new Env({ rootPath: '/test/path', logger });
      env.load({
        preloadList: ['.env'],
        processEnv,
        quiet: true
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env'),
        processEnv,
        quiet: true
      });
    });

    it('should not throw when logger is missing and no file found', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
      const env = new Env({ rootPath: '/test/path' });

      expect(() => env.load({ preloadList: ['.env'] })).not.toThrow();
    });
  });

  describe('resolvePreloadList', () => {
    afterEach(() => {
      delete process.env.APP_ENV;
    });

    it('should return original list when envVar is omitted', () => {
      const list = Env.resolvePreloadList(['.env.local', '.env']);
      expect(list).toEqual(['.env.local', '.env']);
    });

    it('should prepend .env.<value> and dedupe', () => {
      process.env.APP_ENV = 'local';
      const list = Env.resolvePreloadList(['.env.local', '.env'], 'APP_ENV');
      expect(list).toEqual(['.env.local', '.env']);
    });

    it('should prepend when value is not already in list', () => {
      process.env.APP_ENV = 'production';
      const list = Env.resolvePreloadList(['.env.local', '.env'], 'APP_ENV');
      expect(list).toEqual(['.env.production', '.env.local', '.env']);
    });

    it('should return original list when env value is empty', () => {
      process.env.APP_ENV = '';
      const list = Env.resolvePreloadList(['.env.local', '.env'], 'APP_ENV');
      expect(list).toEqual(['.env.local', '.env']);
    });

    it('should not mutate the original preloadList', () => {
      process.env.APP_ENV = 'staging';
      const original = ['.env.local', '.env'];
      const list = Env.resolvePreloadList(original, 'APP_ENV');

      expect(list).toEqual(['.env.staging', '.env.local', '.env']);
      expect(original).toEqual(['.env.local', '.env']);
    });
  });

  describe('remove', () => {
    it('should remove environment variable', () => {
      process.env.TEST_VAR = 'value';
      const env = new Env({ rootPath: '/test/path', logger });
      env.remove('TEST_VAR');

      expect(process.env.TEST_VAR).toBeUndefined();
    });

    it('should do nothing if environment variable does not exist', () => {
      const env = new Env({ rootPath: '/test/path', logger });
      env.remove('NON_EXISTENT_VAR');

      expect(process.env.NON_EXISTENT_VAR).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should get environment variable value', () => {
      process.env.TEST_VAR = 'value';
      const env = new Env({ rootPath: '/test/path', logger });
      const value = env.get('TEST_VAR');

      expect(value).toBe('value');
    });

    it('should return undefined for non-existent variable', () => {
      const env = new Env({ rootPath: '/test/path', logger });
      const value = env.get('NON_EXISTENT_VAR');

      expect(value).toBeUndefined();
    });
  });

  describe('set', () => {
    it('should set environment variable value', () => {
      const env = new Env({ rootPath: '/test/path', logger });
      env.set('TEST_VAR', 'new_value');

      expect(process.env.TEST_VAR).toBe('new_value');
    });

    it('should overwrite existing environment variable value', () => {
      process.env.TEST_VAR = 'old_value';
      const env = new Env({ rootPath: '/test/path', logger });
      env.set('TEST_VAR', 'new_value');

      expect(process.env.TEST_VAR).toBe('new_value');
    });
  });

  describe('getDestroy', () => {
    it('should get and remove environment variable', () => {
      process.env.TEST_VAR = 'value';
      const env = new Env({ rootPath: '/test/path', logger });
      const value = env.getDestroy('TEST_VAR');

      expect(value).toBe('value');
      expect(process.env.TEST_VAR).toBeUndefined();
    });

    it('should return undefined and do nothing if variable does not exist', () => {
      const env = new Env({ rootPath: '/test/path', logger });
      const value = env.getDestroy('NON_EXISTENT_VAR');

      expect(value).toBeUndefined();
    });
  });

  describe('searchEnv', () => {
    it('should search and load .env file', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const env = Env.searchEnv({
        cwd: '/test/path',
        preloadList: ['.env'],
        logger
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env')
      });
      expect(env).toBeInstanceOf(Env);
    });

    it('should warn if no environment files are found', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
      Env.searchEnv({ cwd: '/test/path', preloadList: ['.env'], logger });

      expect(logger.warn).toHaveBeenCalledWith(
        'Reached root directory, stopping search'
      );
      expect(logger.warn).toHaveBeenCalledWith(
        'No environment files (.env) found in directory tree from /test/path to /'
      );
    });

    it('should stop searching after reaching max depth', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);
      Env.searchEnv({
        cwd: '/test/path',
        preloadList: ['.env'],
        logger,
        maxDepth: 1
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Search depth exceeded 1 levels, stopping search at /test/path'
      );
    });

    it('should prefer .env.<value> when envVar is set', () => {
      process.env.APP_ENV = 'staging';
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) => String(path).includes('.env.staging')
      );

      Env.searchEnv({
        cwd: '/test/path',
        envVar: 'APP_ENV',
        logger
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env.staging')
      });

      delete process.env.APP_ENV;
    });

    it('should forward dotenv options to load', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);

      Env.searchEnv({
        cwd: '/test/path',
        preloadList: ['.env'],
        logger,
        encoding: 'latin1',
        override: true
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env'),
        encoding: 'latin1',
        override: true
      });
    });

    it('should search parent directories until a file is found', () => {
      vi.mocked(config).mockClear();
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) =>
          String(path) === toLocalPath('/test/.env') ||
          String(path).endsWith(`${normalize('/test/.env')}`)
      );

      const env = Env.searchEnv({
        cwd: '/test/path/nested',
        preloadList: ['.env'],
        logger,
        maxDepth: 5
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/.env')
      });
      expect(env.rootPath).toBe('/test/path/nested');
    });

    it('should use default preloadList when omitted', () => {
      vi.mocked(config).mockClear();
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) => String(path).includes('.env.local')
      );

      Env.searchEnv({
        cwd: '/test/path',
        logger
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env.local')
      });
    });

    it('should clamp maxDepth to 8', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

      Env.searchEnv({
        cwd: '/a/b/c/d/e/f/g/h/i/j',
        preloadList: ['.env'],
        logger,
        maxDepth: 100
      });

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringMatching(/Search depth exceeded 8 levels/)
      );
    });

    it('should combine envVar and dotenv options', () => {
      process.env.APP_ENV = 'staging';
      (existsSync as ReturnType<typeof vi.fn>).mockImplementation(
        (path: string) => String(path).includes('.env.staging')
      );

      Env.searchEnv({
        cwd: '/test/path',
        envVar: 'APP_ENV',
        logger,
        encoding: 'utf8',
        override: true
      });

      expect(config).toHaveBeenCalledWith({
        path: toLocalPath('/test/path/.env.staging'),
        encoding: 'utf8',
        override: true
      });

      delete process.env.APP_ENV;
    });

    it('should not throw when logger is missing and nothing is found', () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

      expect(() =>
        Env.searchEnv({
          cwd: '/test/path',
          preloadList: ['.env'],
          maxDepth: 1
        })
      ).not.toThrow();
    });
  });
});
