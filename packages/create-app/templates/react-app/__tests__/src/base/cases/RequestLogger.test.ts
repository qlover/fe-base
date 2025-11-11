/**
 * RequestLogger test suite
 *
 * Coverage:
 * 1. constructor      - Logger injection
 * 2. onBefore        - Request initialization logging
 * 3. onSuccess       - Successful request logging
 * 4. onError         - Error handling and logging
 * 5. loggerError     - Error formatting and logging
 */

import { MockLogger } from '@__mocks__/MockLogger';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestLogger } from '@/base/cases/RequestLogger';
import type {
  ApiCatchPluginConfig,
  ApiCatchPluginResponse
} from '@qlover/corekit-bridge';
import type {
  ExecutorContext,
  RequestAdapterFetchConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

describe('RequestLogger', () => {
  let logger: MockLogger;
  let requestLogger: RequestLogger;
  let mockDate: Date;

  beforeEach(() => {
    logger = new MockLogger();
    requestLogger = new RequestLogger(logger);
    mockDate = new Date('2024-01-01T12:00:00');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  describe('plugin properties', () => {
    it('should have correct plugin name', () => {
      expect(requestLogger.pluginName).toBe('RequestLogger');
    });

    it('should have logger instance', () => {
      expect(requestLogger.logger).toBe(logger);
    });
  });

  describe('onBefore', () => {
    it('should log request details before execution', () => {
      const context: ExecutorContext<RequestAdapterFetchConfig<unknown>> = {
        parameters: {
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: { 'Content-Type': 'application/json' }
        },
        returnValue: undefined,
        hooksRuntimes: {}
      };

      requestLogger.onBefore(context);

      expect(logger.log).toHaveBeenCalledWith(
        `%c[Request before]%c [${mockDate.toLocaleString()}] GET https://api.example.com/data`,
        'color: #0ff;',
        'color: inherit;',
        context.parameters
      );
    });
  });

  describe('onSuccess', () => {
    it('should log successful response', async () => {
      const response = { data: { id: 1 }, status: 200 };
      const context: ExecutorContext<
        RequestAdapterFetchConfig & ApiCatchPluginConfig
      > = {
        parameters: {
          method: 'POST',
          url: 'https://api.example.com/create',
          headers: { 'Content-Type': 'application/json' }
        },
        returnValue: response,
        hooksRuntimes: {}
      };

      await requestLogger.onSuccess(context);

      expect(logger.log).toHaveBeenCalledWith(
        `%c[Request success]%c [${mockDate.toLocaleString()}] POST https://api.example.com/create`,
        'color: #0f0;',
        'color: inherit;',
        response
      );
    });

    it('should handle API catch plugin error', async () => {
      const apiError = {
        id: 'API_ERROR',
        message: 'API Error',
        name: 'ExecutorError'
      };
      const response: RequestAdapterResponse & ApiCatchPluginResponse = {
        data: null,
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/error',
          headers: {}
        },
        response: new Response(),
        apiCatchResult: apiError
      };
      const context: ExecutorContext<
        RequestAdapterFetchConfig & ApiCatchPluginConfig
      > = {
        parameters: {
          method: 'GET',
          url: 'https://api.example.com/error',
          headers: {}
        },
        returnValue: response,
        hooksRuntimes: {}
      };

      await requestLogger.onSuccess(context);

      expect(logger.log).toHaveBeenCalledWith(
        `%c[Request error]%c [${mockDate.toLocaleString()}] GET https://api.example.com/error`,
        'color: #f00;',
        'color: inherit;',
        apiError
      );
    });
  });

  describe('onError', () => {
    it('should log request error', () => {
      const error = new Error('Network error');
      const context: ExecutorContext<RequestAdapterFetchConfig> = {
        parameters: {
          method: 'PUT',
          url: 'https://api.example.com/update',
          headers: {}
        },
        error,
        returnValue: undefined,
        hooksRuntimes: {}
      };

      requestLogger.onError(context);

      expect(logger.log).toHaveBeenCalledWith(
        `%c[Request error]%c [${mockDate.toLocaleString()}] PUT https://api.example.com/update`,
        'color: #f00;',
        'color: inherit;',
        error
      );
    });
  });

  describe('loggerError', () => {
    it('should format and log error details', () => {
      const config: RequestAdapterFetchConfig = {
        method: 'DELETE',
        url: 'https://api.example.com/delete',
        headers: {}
      };
      const error = new Error('Operation failed');

      requestLogger.loggerError(config, error);

      expect(logger.log).toHaveBeenCalledWith(
        `%c[Request error]%c [${mockDate.toLocaleString()}] DELETE https://api.example.com/delete`,
        'color: #f00;',
        'color: inherit;',
        error
      );
    });

    it('should handle non-Error objects', () => {
      const config: RequestAdapterFetchConfig = {
        method: 'GET',
        url: 'https://api.example.com/data',
        headers: {}
      };
      const error = { code: 404, message: 'Not found' };

      requestLogger.loggerError(config, error);

      expect(logger.log).toHaveBeenCalledWith(
        `%c[Request error]%c [${mockDate.toLocaleString()}] GET https://api.example.com/data`,
        'color: #f00;',
        'color: inherit;',
        error
      );
    });
  });
});
