import { describe, it, expect } from 'vitest';
import { isRequestAdapterResponse } from '../../../src/request/utils/isRequestAdapterResponse';
import { RequestAdapterResponse } from '../../../src/request/interface/RequestAdapter';

describe('isRequestAdapterResponse', () => {
  describe('Valid RequestAdapterResponse objects', () => {
    it('should return true for a valid RequestAdapterResponse', () => {
      const validResponse: RequestAdapterResponse = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
        config: { url: '/api/users' },
        response: new Response()
      };

      expect(isRequestAdapterResponse(validResponse)).toBe(true);
    });

    it('should return true for RequestAdapterResponse with empty data', () => {
      const response: RequestAdapterResponse = {
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: { url: '/api/users' },
        response: new Response()
      };

      expect(isRequestAdapterResponse(response)).toBe(true);
    });

    it('should return true for RequestAdapterResponse with array data', () => {
      const response: RequestAdapterResponse = {
        data: [{ id: 1 }, { id: 2 }],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/api/users' },
        response: new Response()
      };

      expect(isRequestAdapterResponse(response)).toBe(true);
    });
  });

  describe('Invalid values', () => {
    it('should return false for null', () => {
      expect(isRequestAdapterResponse(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRequestAdapterResponse(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isRequestAdapterResponse('string')).toBe(false);
      expect(isRequestAdapterResponse(123)).toBe(false);
      expect(isRequestAdapterResponse(true)).toBe(false);
    });

    it('should return false for object without response property', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with non-Response response property', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        response: 'not a Response'
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object missing status property', () => {
      const obj = {
        data: { id: 1 },
        statusText: 'OK',
        headers: {},
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with non-number status', () => {
      const obj = {
        data: { id: 1 },
        status: '200',
        statusText: 'OK',
        headers: {},
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object missing statusText property', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        headers: {},
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with non-string statusText', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 200,
        headers: {},
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object missing headers property', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with null headers', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: null,
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with non-object headers', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: 'not an object',
        config: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object missing config property', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with null config', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: null,
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });

    it('should return false for object with non-object config', () => {
      const obj = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: 'not an object',
        response: new Response()
      };

      expect(isRequestAdapterResponse(obj)).toBe(false);
    });
  });

  describe('Type narrowing', () => {
    it('should narrow type correctly in TypeScript', () => {
      const value: unknown = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        response: new Response()
      };

      if (isRequestAdapterResponse(value)) {
        // TypeScript should know these properties exist
        expect(typeof value.status).toBe('number');
        expect(typeof value.statusText).toBe('string');
        expect(typeof value.headers).toBe('object');
        expect(typeof value.config).toBe('object');
        expect(value.response instanceof Response).toBe(true);
      } else {
        throw new Error('Type guard should have passed');
      }
    });
  });
});

