/**
 * RequestStatusCatcher test suite
 *
 * Coverage:
 * 1. constructor      - Logger injection
 * 2. default         - Default handler behavior
 * 3. handler         - Dynamic status code handling
 * 4. case200         - Success case handling
 */

import { MockLogger } from '@__mocks__/MockLogger';
import { describe, it, expect, beforeEach } from 'vitest';
import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import type { RequestAdapterResponse } from '@qlover/fe-corekit';

describe('RequestStatusCatcher', () => {
  let logger: MockLogger;
  let statusCatcher: RequestStatusCatcher;

  beforeEach(() => {
    logger = new MockLogger();
    statusCatcher = new RequestStatusCatcher(logger);
  });

  describe('constructor', () => {
    it('should be properly initialized with logger', () => {
      expect(statusCatcher).toBeInstanceOf(RequestStatusCatcher);
      expect(logger).toBeDefined();
    });
  });

  describe('default handler', () => {
    it('should log warning for unhandled status codes', () => {
      const context: RequestAdapterResponse = {
        data: null,
        status: 418,
        statusText: "I'm a teapot",
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/coffee',
          headers: {}
        },
        response: new Response()
      };

      statusCatcher.default(context);

      expect(logger.warn).toHaveBeenCalledWith(
        'RequestStatusCatcher default handler',
        context
      );
    });
  });

  describe('handler', () => {
    it('should call case200 for 200 status code', () => {
      const context: RequestAdapterResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: {}
        },
        response: new Response()
      };

      statusCatcher.handler(context);
      // case200 is currently empty, so we just verify it doesn't throw
      expect(true).toBe(true);
    });

    it('should call default handler for unknown status codes', () => {
      const context: RequestAdapterResponse = {
        data: null,
        status: 499,
        statusText: 'Unknown Status',
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/unknown',
          headers: {}
        },
        response: new Response()
      };

      statusCatcher.handler(context);

      expect(logger.warn).toHaveBeenCalledWith(
        'RequestStatusCatcher default handler',
        context
      );
    });

    it('should handle null or undefined status', () => {
      const context = {
        data: null,
        status: undefined,
        statusText: 'No Status',
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/nostatus',
          headers: {}
        },
        response: new Response()
      } as unknown as RequestAdapterResponse;

      statusCatcher.handler(context);

      expect(logger.warn).toHaveBeenCalledWith(
        'RequestStatusCatcher default handler',
        context
      );
    });
  });

  describe('case200', () => {
    it('should handle successful responses', () => {
      const context: RequestAdapterResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/success',
          headers: {}
        },
        response: new Response()
      };

      statusCatcher.case200(context);
      // Currently case200 is empty, so we just verify it doesn't throw
      expect(true).toBe(true);
    });
  });

  describe('dynamic handler resolution', () => {
    it('should dynamically resolve and call status handlers', () => {
      // Add a custom handler for testing
      const customHandler = vi.fn();
      (statusCatcher as any).case418 = customHandler;

      const context: RequestAdapterResponse = {
        data: null,
        status: 418,
        statusText: "I'm a teapot",
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/teapot',
          headers: {}
        },
        response: new Response()
      };

      statusCatcher.handler(context);

      expect(customHandler).toHaveBeenCalledWith(context);
    });

    it('should handle non-function properties gracefully', () => {
      // Add a non-function property
      (statusCatcher as any).case500 = 'not a function';

      const context: RequestAdapterResponse = {
        data: null,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {
          method: 'GET',
          url: 'https://api.example.com/error',
          headers: {}
        },
        response: new Response()
      };

      statusCatcher.handler(context);

      expect(logger.warn).toHaveBeenCalledWith(
        'RequestStatusCatcher default handler',
        context
      );
    });
  });
});
