/**
 * AppError test suite
 *
 * Coverage:
 * 1. constructor       - Constructor initialization with different source types
 * 2. inheritance      - Verify inheritance from ExecutorError
 * 3. error properties - Verify error properties are set correctly
 */

import { ExecutorError } from '@qlover/fe-corekit';
import { describe, it, expect } from 'vitest';
import { AppError } from '@/base/cases/AppError';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create instance with id only', () => {
      const error = new AppError('TEST_ERROR');
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ExecutorError);
      expect(error).toBeInstanceOf(Error);
      expect(error.id).toBe('TEST_ERROR');
      expect(error.message).toBe('TEST_ERROR');
      expect(error.source).toBeUndefined();
    });

    it('should create instance with string source', () => {
      const source = 'Test error message';
      const error = new AppError('TEST_ERROR', source);
      expect(error.id).toBe('TEST_ERROR');
      expect(error.message).toBe(source);
      expect(error.source).toBe(source);
    });

    it('should create instance with Error source', () => {
      const source = new Error('Original error');
      const error = new AppError('TEST_ERROR', source);
      expect(error.id).toBe('TEST_ERROR');
      expect(error.message).toBe('Original error');
      expect(error.source).toBe(source);
    });
  });

  describe('error properties', () => {
    it('should have correct error type', () => {
      const error = new AppError('TEST_ERROR');
      expect(error.id).toBe('TEST_ERROR');
    });

    it('should maintain id property', () => {
      const error = new AppError('TEST_ERROR');
      Object.defineProperty(error, 'id', { value: 'NEW_ID' });
      expect(error.id).toBe('NEW_ID');
    });

    it('should maintain source property', () => {
      const source = 'source';
      const error = new AppError('TEST_ERROR', source);
      Object.defineProperty(error, 'source', { value: 'new source' });
      expect(error.source).toBe('new source');
    });
  });

  describe('error handling', () => {
    it('should work in try-catch block', () => {
      expect(() => {
        throw new AppError('TEST_ERROR');
      }).toThrow(AppError);
    });

    it('should preserve stack trace', () => {
      const error = new AppError('TEST_ERROR');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError.test.ts');
    });

    it('should handle nested errors', () => {
      const originalError = new Error('Original error');
      const wrappedError = new AppError('WRAPPED_ERROR', originalError);
      expect(wrappedError.source).toBe(originalError);
      expect(wrappedError.message).toBe('Original error');
    });
  });

  describe('error message formatting', () => {
    it('should use id as message when source is undefined', () => {
      const error = new AppError('TEST_ERROR');
      expect(error.message).toBe('TEST_ERROR');
    });

    it('should use source message when source is Error', () => {
      const source = new Error('Source error message');
      const error = new AppError('TEST_ERROR', source);
      expect(error.message).toBe('Source error message');
    });

    it('should use source string when source is string', () => {
      const source = 'Source error message';
      const error = new AppError('TEST_ERROR', source);
      expect(error.message).toBe('Source error message');
    });
  });
});
