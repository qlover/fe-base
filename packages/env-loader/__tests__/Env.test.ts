import { Env } from '../src/Env';
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
      warn: vi.fn(),
      debug: vi.fn()
    } as unknown as Logger;
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
  });
});
