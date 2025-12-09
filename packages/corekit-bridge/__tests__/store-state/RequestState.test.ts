/**
 * RequestState test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor initialization tests
 * 2. end              - End method functionality tests
 * 3. usage scenarios  - Real-world usage tests
 * 4. type safety      - Type system tests
 * 5. edge cases       - Edge case handling tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RequestState } from '../../src/core/store-state/impl/RequestState';

describe('RequestState', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp for testing
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const state = new RequestState();
      expect(state.loading).toBe(false);
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
      expect(state.startTime).toBe(1000);
      expect(state.endTime).toBe(0);
    });

    it('should initialize with provided values', () => {
      const result = { id: 1 };
      const state = new RequestState(true, result);
      expect(state.loading).toBe(true);
      expect(state.result).toBe(result);
      expect(state.error).toBeNull();
      expect(state.startTime).toBe(1000);
      expect(state.endTime).toBe(0);
    });

    it('should initialize with error state', () => {
      const error = new Error('Test error');
      const state = new RequestState(false, null, error);
      expect(state.loading).toBe(false);
      expect(state.result).toBeNull();
      expect(state.error).toBe(error);
      expect(state.startTime).toBe(1000);
      expect(state.endTime).toBe(0);
    });
  });

  describe('end', () => {
    it('should update endTime and return this', () => {
      const state = new RequestState();
      vi.spyOn(Date, 'now').mockImplementation(() => 2000);
      const result = state.end();
      expect(result).toBe(state); // Should return this for chaining
      expect(state.endTime).toBe(2000);
    });

    it('should calculate correct duration', () => {
      const state = new RequestState();
      // Simulate time passing
      vi.spyOn(Date, 'now').mockImplementation(() => 3000);
      state.end();
      const duration = state.endTime - state.startTime;
      expect(duration).toBe(2000); // 3000 - 1000 = 2000ms
    });
  });

  describe('usage scenarios', () => {
    it('should handle successful request flow', async () => {
      const state = new RequestState<number>();
      const mockFetch = vi.fn().mockResolvedValue(42);

      try {
        state.loading = true;
        state.result = await mockFetch();
      } finally {
        state.loading = false;
        state.end();
      }

      expect(state.loading).toBe(false);
      expect(state.result).toBe(42);
      expect(state.error).toBeNull();
      expect(state.endTime).toBeGreaterThan(0);
    });

    it('should handle error request flow', async () => {
      const state = new RequestState<number>();
      const error = new Error('API Error');
      const mockFetch = vi.fn().mockRejectedValue(error);

      try {
        state.loading = true;
        await mockFetch();
      } catch (e) {
        state.error = e;
      } finally {
        state.loading = false;
        state.end();
      }

      expect(state.loading).toBe(false);
      expect(state.result).toBeNull();
      expect(state.error).toBe(error);
      expect(state.endTime).toBeGreaterThan(0);
    });
  });

  describe('with request wrapper', () => {
    async function withRequestState<T>(
      operation: () => Promise<T>
    ): Promise<RequestState<T>> {
      const state = new RequestState<T>(true);
      try {
        state.result = await operation();
        return state;
      } catch (error) {
        state.error = error;
        return state;
      } finally {
        state.loading = false;
        state.end();
      }
    }

    it('should handle successful operation', async () => {
      const mockOperation = vi.fn().mockResolvedValue('success');
      const state = await withRequestState(mockOperation);
      expect(state.loading).toBe(false);
      expect(state.result).toBe('success');
      expect(state.error).toBeNull();
      expect(state.endTime).toBeGreaterThan(0);
    });

    it('should handle failed operation', async () => {
      const error = new Error('Operation failed');
      const mockOperation = vi.fn().mockRejectedValue(error);
      const state = await withRequestState(mockOperation);
      expect(state.loading).toBe(false);
      expect(state.result).toBeNull();
      expect(state.error).toBe(error);
      expect(state.endTime).toBeGreaterThan(0);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety with generics', () => {
      interface User {
        id: number;
        name: string;
      }

      const state = new RequestState<User>();
      const user = { id: 1, name: 'Test' };

      state.result = user; // Should compile without type errors
      expect(state.result?.name).toBe('Test');

      // @ts-expect-error - Type '{ invalid: string; }' is not assignable to type 'User'
      state.result = { invalid: 'field' };
    });
  });

  describe('edge cases', () => {
    it('should handle multiple end() calls', () => {
      const state = new RequestState();
      vi.spyOn(Date, 'now').mockImplementation(() => 2000);
      state.end();
      const firstEndTime = state.endTime;
      vi.spyOn(Date, 'now').mockImplementation(() => 3000);
      state.end();
      const secondEndTime = state.endTime;
      expect(secondEndTime).toBeGreaterThan(firstEndTime);
    });

    it('should handle state transitions', () => {
      const state = new RequestState();
      // Initial state
      expect(state.loading).toBe(false);
      // Start loading
      state.loading = true;
      expect(state.loading).toBe(true);
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
      // Set result
      state.loading = false;
      state.result = 'data';
      expect(state.loading).toBe(false);
      expect(state.result).toBe('data');
      expect(state.error).toBeNull();
      // Set error
      state.error = new Error('Failed');
      state.result = null;
      expect(state.loading).toBe(false);
      expect(state.result).toBeNull();
      expect(state.error).toBeDefined();
    });
  });
});
