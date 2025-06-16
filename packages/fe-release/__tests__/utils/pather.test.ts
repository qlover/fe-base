import { describe, it, expect } from 'vitest';
import { Pather } from '../../src/utils/pather';
import { sep } from 'node:path';

describe('Pather utils', () => {
  const pather = new Pather();

  describe('toLocalPath', () => {
    it('should convert mixed separators to local path', () => {
      const expected = ['src', 'a', 'b'].join(sep);

      expect(pather.toLocalPath('src\\a//b')).toEqual(expected);
      expect(pather.toLocalPath('src\\a\\b')).toEqual(expected);
      expect(pather.toLocalPath('src/a/b')).toEqual(expected);
      expect(pather.toLocalPath('src//a//b')).toEqual(expected);
      expect(pather.toLocalPath('src\\\\a\\\\b')).toEqual(expected);
    });

    it('should preserve trailing separator when present', () => {
      const expected = ['src', 'a', 'b'].join(sep) + sep;

      expect(pather.toLocalPath('src\\a\\b\\')).toEqual(expected);
      expect(pather.toLocalPath('src/a/b/')).toEqual(expected);
      expect(pather.toLocalPath('src//a//b//')).toEqual(expected);
    });

    it('should handle relative path segments', () => {
      expect(pather.toLocalPath('src/../lib/index.js')).toEqual(
        ['lib', 'index.js'].join(sep)
      );
      expect(pather.toLocalPath('src/./utils/helper.ts')).toEqual(
        ['src', 'utils', 'helper.ts'].join(sep)
      );
      expect(pather.toLocalPath('./src/index.ts')).toEqual(
        ['src', 'index.ts'].join(sep)
      );
      expect(pather.toLocalPath('../parent/file.txt')).toEqual(
        ['..', 'parent', 'file.txt'].join(sep)
      );
    });

    it('should handle edge cases', () => {
      expect(pather.toLocalPath('')).toEqual('.');
      expect(pather.toLocalPath('.')).toEqual('.');
      expect(pather.toLocalPath('..')).toEqual('..');
      expect(pather.toLocalPath('/')).toEqual(sep);
      expect(pather.toLocalPath('\\')).toEqual(sep);
      expect(pather.toLocalPath('//')).toEqual(sep);
      expect(pather.toLocalPath('\\\\')).toEqual(sep);
    });

    it('should handle complex mixed paths', () => {
      expect(pather.toLocalPath('src\\..//lib/./utils\\helper.ts')).toEqual(
        ['lib', 'utils', 'helper.ts'].join(sep)
      );

      expect(pather.toLocalPath('a\\b/../c//d/./e')).toEqual(
        ['a', 'c', 'd', 'e'].join(sep)
      );
    });
  });

  describe('isSubPath', () => {
    it('should detect direct subpaths', () => {
      expect(pather.isSubPath('src/index.ts', 'src')).toBe(true);
      expect(pather.isSubPath('src\\utils\\helper.ts', 'src')).toBe(true);
      expect(pather.isSubPath('src/a/b/c', 'src/a')).toBe(true);
    });

    it('should handle mixed separators', () => {
      expect(pather.isSubPath('src\\a//b', 'src/a')).toBe(true);
      expect(pather.isSubPath('src/a/b', 'src\\a')).toBe(true);
      expect(pather.isSubPath('src\\\\a\\b', 'src//a')).toBe(true);
    });

    it('should respect segment boundaries', () => {
      expect(pather.isSubPath('src/ab', 'src/a')).toBe(false);
      expect(pather.isSubPath('srctest', 'src')).toBe(false);
      expect(pather.isSubPath('lib/index.ts', 'lib2')).toBe(false);
    });

    it('should handle equal paths', () => {
      expect(pather.isSubPath('src', 'src')).toBe(true);
      expect(pather.isSubPath('src/', 'src')).toBe(true);
      expect(pather.isSubPath('src', 'src/')).toBe(true);
      expect(pather.isSubPath('src//', 'src\\\\')).toBe(true);
    });

    it('should handle trailing separators', () => {
      expect(pather.isSubPath('src/utils/', 'src/')).toBe(true);
      expect(pather.isSubPath('src/utils', 'src/')).toBe(true);
      expect(pather.isSubPath('src/utils/', 'src')).toBe(true);
    });

    it('should handle relative paths', () => {
      expect(pather.isSubPath('./src/index.ts', './src')).toBe(true);
      expect(pather.isSubPath('../lib/utils/helper.ts', '../lib')).toBe(true);
      expect(pather.isSubPath('src/../lib/index.ts', 'lib')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(pather.isSubPath('', '')).toBe(true);
      expect(pather.isSubPath('.', '.')).toBe(true);
      expect(pather.isSubPath('..', '..')).toBe(true);
      expect(pather.isSubPath('a', '')).toBe(false);
      expect(pather.isSubPath('', 'a')).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('should detect path prefixes', () => {
      expect(pather.startsWith('src/index.ts', 'src')).toBe(true);
      expect(pather.startsWith('src/utils/helper.ts', 'src/utils')).toBe(true);
      expect(pather.startsWith('lib/index.js', 'lib')).toBe(true);
    });

    it('should handle mixed separators', () => {
      expect(pather.startsWith('src\\utils\\helper.ts', 'src/utils')).toBe(
        true
      );
      expect(pather.startsWith('src/utils/helper.ts', 'src\\utils')).toBe(true);
    });

    it('should be case sensitive', () => {
      expect(pather.startsWith('Src/index.ts', 'src')).toBe(false);
      expect(pather.startsWith('src/Index.ts', 'src/index')).toBe(false);
    });

    it('should handle exact matches', () => {
      expect(pather.startsWith('src', 'src')).toBe(true);
      expect(pather.startsWith('src/', 'src')).toBe(true);
      expect(pather.startsWith('src', 'src/')).toBe(true);
    });

    it('should handle partial matches correctly', () => {
      expect(pather.startsWith('srctest', 'src')).toBe(true); // This is substring behavior
      expect(pather.startsWith('src/ab', 'src/a')).toBe(true); // This is substring behavior
    });
  });

  describe('containsPath', () => {
    it('should detect path segments within paths', () => {
      expect(pather.containsPath('src/utils/helper.ts', 'utils')).toBe(true);
      expect(pather.containsPath('lib/src/index.ts', 'src')).toBe(true);
      expect(pather.containsPath('a/b/c/d', 'b/c')).toBe(true);
    });

    it('should respect segment boundaries', () => {
      expect(pather.containsPath('src/utilities/helper.ts', 'util')).toBe(
        false
      );
      expect(pather.containsPath('lib/srctest/index.ts', 'src')).toBe(false);
      expect(pather.containsPath('a/bc/d', 'b')).toBe(false);
    });

    it('should handle mixed separators', () => {
      expect(pather.containsPath('src\\utils\\helper.ts', 'utils')).toBe(true);
      expect(pather.containsPath('lib/src\\index.ts', 'src')).toBe(true);
    });

    it('should handle exact matches', () => {
      expect(pather.containsPath('src', 'src')).toBe(true);
      expect(pather.containsPath('src/', 'src')).toBe(true);
      expect(pather.containsPath('src', 'src/')).toBe(true);
    });

    it('should handle paths at start and end', () => {
      expect(pather.containsPath('src/utils/helper.ts', 'src')).toBe(true);
      expect(pather.containsPath('lib/utils/helper.ts', 'helper.ts')).toBe(
        true
      );
    });

    it('should handle multiple occurrences', () => {
      expect(pather.containsPath('src/src/index.ts', 'src')).toBe(true);
      expect(pather.containsPath('utils/lib/utils/helper.ts', 'utils')).toBe(
        true
      );
    });

    it('should handle relative paths', () => {
      expect(pather.containsPath('./src/utils/helper.ts', 'utils')).toBe(true);
      expect(pather.containsPath('../lib/src/index.ts', 'src')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(pather.containsPath('', '')).toBe(true);
      expect(pather.containsPath('a', '')).toBe(false);
      expect(pather.containsPath('', 'a')).toBe(false);
      expect(pather.containsPath('a/b', 'a/b/c')).toBe(false);
    });
  });

  describe('cross-method consistency', () => {
    it('should maintain consistency between methods', () => {
      const testCases = [
        ['src/utils/helper.ts', 'src'],
        ['lib\\index.js', 'lib'],
        ['a/b/c/d', 'a/b'],
        ['./src/index.ts', './src']
      ];

      testCases.forEach(([child, parent]) => {
        if (pather.isSubPath(child, parent)) {
          expect(pather.startsWith(child, parent)).toBe(true);
          expect(pather.containsPath(child, parent)).toBe(true);
        }
      });
    });
  });
});
