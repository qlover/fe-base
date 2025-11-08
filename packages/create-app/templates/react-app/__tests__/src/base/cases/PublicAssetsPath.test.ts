/**
 * PublicAssetsPath test suite
 *
 * Coverage:
 * 1. constructor      - Default and custom prefix initialization
 * 2. getPath         - Simple path concatenation with prefix
 */

import { routerPrefix } from '@config/common';
import { describe, it, expect } from 'vitest';
import { PublicAssetsPath } from '@/base/cases/PublicAssetsPath';

describe('PublicAssetsPath', () => {
  describe('constructor', () => {
    it('should initialize with default prefix from config', () => {
      const publicPath = new PublicAssetsPath();
      expect(publicPath.getPath('test')).toBe(`${routerPrefix}/test`);
    });

    it('should initialize with custom prefix', () => {
      const customPrefix = '/custom';
      const publicPath = new PublicAssetsPath(customPrefix);
      expect(publicPath.getPath('test')).toBe('/custom/test');
    });

    it('should initialize with empty prefix', () => {
      const publicPath = new PublicAssetsPath('');
      expect(publicPath.getPath('test')).toBe('/test');
    });
  });

  describe('getPath', () => {
    it('should concatenate prefix with path', () => {
      const publicPath = new PublicAssetsPath('/prefix');
      expect(publicPath.getPath('test')).toBe('/prefix/test');
    });

    it('should handle empty path', () => {
      const publicPath = new PublicAssetsPath('/prefix');
      expect(publicPath.getPath('')).toBe('/prefix/');
    });

    it('should preserve the input path as is', () => {
      const publicPath = new PublicAssetsPath('/prefix');
      const paths = [
        'simple/path',
        '/path/with/leading/slash',
        'path/with/trailing/slash/',
        'path with spaces',
        'path/with/unicode/字符',
        'path?with=query#and-hash'
      ];

      paths.forEach((path) => {
        expect(publicPath.getPath(path)).toBe(
          `/prefix/${path.replace(/^\//, '')}`
        );
      });
    });
  });
});
