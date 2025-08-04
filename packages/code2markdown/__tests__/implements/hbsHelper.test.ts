/**
 * hbsHelper test-suite
 *
 * Coverage:
 * 1. toLowerCase    - String case conversion tests
 * 2. eq            - Equality comparison tests
 * 3. or            - Logical OR operation tests
 * 4. repeat        - String/block repetition tests
 * 5. add           - Number addition tests
 * 6. formatTag     - Tag formatting tests
 */

import { describe, it, expect } from 'vitest';
import { hbsHelpers } from '../../src/implments/hbsHelper';
import Handlebars from 'handlebars';

describe('hbsHelpers', () => {
  describe('toLowerCase', () => {
    it('should convert string to lowercase', () => {
      expect(hbsHelpers.toLowerCase('HELLO WORLD')).toBe('hello world');
      expect(hbsHelpers.toLowerCase('Mixed Case')).toBe('mixed case');
      expect(hbsHelpers.toLowerCase('already lower')).toBe('already lower');
    });

    it('should handle non-string values', () => {
      expect(hbsHelpers.toLowerCase(123 as unknown as string)).toBe(123);
      expect(hbsHelpers.toLowerCase(null as unknown as string)).toBe(null);
      expect(hbsHelpers.toLowerCase(undefined as unknown as string)).toBe(
        undefined
      );
    });
  });

  describe('eq', () => {
    it('should compare values strictly', () => {
      expect(hbsHelpers.eq('test', 'test')).toBe(true);
      expect(hbsHelpers.eq(123, 123)).toBe(true);
      expect(hbsHelpers.eq(true, true)).toBe(true);
      expect(hbsHelpers.eq(null, null)).toBe(true);
    });

    it('should handle different types', () => {
      expect(hbsHelpers.eq('123', 123)).toBe(false);
      expect(hbsHelpers.eq(0, false)).toBe(false);
      expect(hbsHelpers.eq('', false)).toBe(false);
    });

    it('should handle undefined and null', () => {
      expect(hbsHelpers.eq(undefined, null)).toBe(false);
      expect(hbsHelpers.eq(undefined, undefined)).toBe(true);
      expect(hbsHelpers.eq(null, undefined)).toBe(false);
    });
  });

  describe('or', () => {
    it('should handle multiple truthy values', () => {
      expect(hbsHelpers.or(true, false)).toBe(true);
      expect(hbsHelpers.or(false, true, false)).toBe(true);
      expect(hbsHelpers.or('text', 0, false)).toBe(true);
    });

    it('should handle all falsy values', () => {
      expect(hbsHelpers.or(false, 0, '', null, undefined)).toBe(false);
      expect(hbsHelpers.or()).toBe(false);
    });

    it('should handle handlebars options object', () => {
      const options = {
        fn: () => {},
        inverse: () => {},
        hash: {}
      } as unknown as Handlebars.HelperOptions;
      expect(hbsHelpers.or(false, options)).toBe(false);
      expect(hbsHelpers.or(true, options)).toBe(true);
    });
  });

  describe('repeat', () => {
    it('should repeat string with regular helper syntax', () => {
      expect(hbsHelpers.repeat(2, '-')).toBe('-----'); // count + 3, max 6
      expect(hbsHelpers.repeat(1, 'x')).toBe('xxxx');
      expect(hbsHelpers.repeat(3, '=')).toBe('======');
    });

    it('should handle block helper syntax', () => {
      const options = {
        fn: () => 'test\n',
        inverse: () => '',
        hash: {}
      } as unknown as Handlebars.HelperOptions;

      expect(hbsHelpers.repeat(3, options)).toBe('test\ntest\ntest\n');
      expect(hbsHelpers.repeat(1, options)).toBe('test\n');
    });

    it('should respect maximum repeat limit', () => {
      expect(hbsHelpers.repeat(10, '-')).toBe('------'); // max 6
      const options = {
        fn: () => 'test\n',
        inverse: () => '',
        hash: {}
      } as unknown as Handlebars.HelperOptions;
      expect(hbsHelpers.repeat(10, options)).toBe(
        'test\ntest\ntest\ntest\ntest\ntest\n'
      );
    });

    it('should handle invalid inputs', () => {
      expect(hbsHelpers.repeat(0, '-')).toBe('---');
      expect(hbsHelpers.repeat(-1, '-')).toBe('--');
      expect(hbsHelpers.repeat(NaN, '-')).toBe('---');
    });
  });

  describe('add', () => {
    it('should add two numbers', () => {
      expect(hbsHelpers.add(1, 2)).toBe(3);
      expect(hbsHelpers.add(-1, 1)).toBe(0);
      expect(hbsHelpers.add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    it('should handle edge cases', () => {
      expect(hbsHelpers.add(0, 0)).toBe(0);
      expect(hbsHelpers.add(Number.MAX_SAFE_INTEGER, 1)).toBe(
        Number.MAX_SAFE_INTEGER + 1
      );
      expect(hbsHelpers.add(Number.MIN_SAFE_INTEGER, -1)).toBe(
        Number.MIN_SAFE_INTEGER - 1
      );
    });
  });

  describe('formatTag', () => {
    it('should format tag with @ prefix', () => {
      expect(hbsHelpers.formatTag('@param')).toBe('Param');
      expect(hbsHelpers.formatTag('@returns')).toBe('Returns');
      expect(hbsHelpers.formatTag('@example')).toBe('Example');
    });

    it('should format tag without @ prefix', () => {
      expect(hbsHelpers.formatTag('param')).toBe('Param');
      expect(hbsHelpers.formatTag('returns')).toBe('Returns');
      expect(hbsHelpers.formatTag('example')).toBe('Example');
    });

    it('should handle special cases', () => {
      expect(hbsHelpers.formatTag('')).toBe('');
      expect(hbsHelpers.formatTag('@')).toBe('');
      expect(hbsHelpers.formatTag('alreadyCapitalized')).toBe(
        'AlreadyCapitalized'
      );
    });

    it('should handle non-string values', () => {
      expect(hbsHelpers.formatTag(123 as unknown as string)).toBe(123);
      expect(hbsHelpers.formatTag(null as unknown as string)).toBe(null);
      expect(hbsHelpers.formatTag(undefined as unknown as string)).toBe(
        undefined
      );
    });
  });
});
