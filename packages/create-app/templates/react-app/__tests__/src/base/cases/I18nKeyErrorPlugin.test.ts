/**
 * I18nKeyErrorPlugin test suite
 *
 * Coverage:
 * 1. constructor       - Constructor initialization
 * 2. plugin name      - Plugin name verification
 * 3. onError handling - Error translation behavior
 * 4. edge cases       - Various error scenarios
 */

import { MockLogger } from '@__mocks__/MockLogger';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';
import { I18nService } from '@/base/services/I18nService';
import type { ExecutorContext } from '@qlover/fe-corekit';

class MockI18nService extends I18nService {
  constructor() {
    super('/');
  }

  public t = vi.fn((key: string) => key);
  public changeLanguage = vi.fn();
  public changeLoading = vi.fn();
  public onBefore = vi.fn();
}

describe('I18nKeyErrorPlugin', () => {
  let plugin: I18nKeyErrorPlugin;
  let mockLogger: MockLogger;
  let mockI18nService: MockI18nService;

  beforeEach(() => {
    mockLogger = new MockLogger();
    mockI18nService = new MockI18nService();
    plugin = new I18nKeyErrorPlugin(mockLogger, mockI18nService);
  });

  describe('plugin properties', () => {
    it('should have correct plugin name', () => {
      expect(plugin.pluginName).toBe('I18nKeyErrorPlugin');
    });
  });

  describe('onError handling', () => {
    it('should handle non-Error objects', () => {
      const context: ExecutorContext<unknown> = {
        error: new Error('not an error'),
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };
      const result = plugin.onError(context);
      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockI18nService.t).toHaveBeenCalledWith('not an error');
    });

    it('should handle Error objects without i18n key', () => {
      const error = new Error('regular error');
      const context: ExecutorContext<unknown> = {
        error,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };
      const result = plugin.onError(context);
      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockI18nService.t).toHaveBeenCalledWith('regular error');
    });

    it('should translate i18n key errors', () => {
      const error = new Error('error.key');
      mockI18nService.t.mockReturnValueOnce('Translated error message');

      const context: ExecutorContext<unknown> = {
        error,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(Error);
      expect(result?.message).toBe('Translated error message');
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'I18nKeyErrorPlugin Error:',
        'Translated error message'
      );
      expect(mockI18nService.t).toHaveBeenCalledWith('error.key');
    });

    it('should not translate when i18n returns same key', () => {
      const error = new Error('error.key');
      mockI18nService.t.mockReturnValueOnce('error.key');

      const context: ExecutorContext<unknown> = {
        error,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };

      const result = plugin.onError(context);

      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockI18nService.t).toHaveBeenCalledWith('error.key');
    });
  });

  describe('error translation', () => {
    it('should handle complex i18n keys with parameters', () => {
      const error = new Error('error.with.params');
      mockI18nService.t.mockReturnValueOnce(
        'Error with param1: {0} and param2: {1}'
      );

      const context: ExecutorContext<unknown> = {
        error,
        parameters: { param1: 'value1', param2: 'value2' },
        returnValue: undefined,
        hooksRuntimes: {}
      };

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(Error);
      expect(mockI18nService.t).toHaveBeenCalledWith('error.with.params');
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should handle nested error objects', () => {
      const originalError = new Error('original.error');
      const wrappedError = new Error('wrapped.error');
      // @ts-expect-error
      wrappedError.cause = originalError;

      mockI18nService.t
        .mockReturnValueOnce('Wrapped Error')
        .mockReturnValueOnce('Original Error');

      const context: ExecutorContext<unknown> = {
        error: wrappedError,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };

      const result = plugin.onError(context);

      expect(result).toBeInstanceOf(Error);
      expect(mockI18nService.t).toHaveBeenCalledWith('wrapped.error');
      expect(mockLogger.debug).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty error message', () => {
      const error = new Error('');
      const context: ExecutorContext<unknown> = {
        error,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };
      const result = plugin.onError(context);
      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      // Empty string is not a valid i18n key, so t() should not be called
      expect(mockI18nService.t).not.toHaveBeenCalled();
    });

    it('should handle null error message', () => {
      const error = new Error();
      error.message = ''; // Force empty message
      const context: ExecutorContext<unknown> = {
        error,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };
      const result = plugin.onError(context);
      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      // Empty string is not a valid i18n key, so t() should not be called
      expect(mockI18nService.t).not.toHaveBeenCalled();
    });

    it('should handle undefined context error', () => {
      const context: ExecutorContext<unknown> = {
        error: undefined,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };
      const result = plugin.onError(context);
      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockI18nService.t).not.toHaveBeenCalled();
    });

    it('should handle null context error', () => {
      const context: ExecutorContext<unknown> = {
        error: undefined,
        parameters: {},
        returnValue: undefined,
        hooksRuntimes: {}
      };
      const result = plugin.onError(context);
      expect(result).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
      expect(mockI18nService.t).not.toHaveBeenCalled();
    });
  });
});
