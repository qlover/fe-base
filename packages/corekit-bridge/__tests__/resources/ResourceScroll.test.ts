/**
 * ResourceScroll test suite
 *
 * Coverage:
 * 1. constructor – requires gateway resource
 * 2. search      – sets criteria and delegates to gateway.search
 * 3. loadFirst   – normalizes first window (cursor cleared, page 1)
 * 4. loadNext    – cursor vs page increment; synchronous errors (hasMore, missing window)
 * 5. refresh     – repeats stored criteria when omitted; strict response guard
 * 6. failure     – criteria rollback on rejected search
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { AsyncStoreStatus } from '../../src/core/store-state';
import { ResourceScroll } from '../../src/core/resources/impl/ResourceScroll';
import type { ResourceScrollInterface } from '../../src/core/resources/interfaces/ResourceScrollInterface';
import type { ResourceSearchResult } from '../../src/core/resources/interfaces/ResourceSearchInterface';

type Criteria = {
  page?: number;
  pageSize?: number;
  cursor?: string | null;
};
type Item = { id: number };

describe('ResourceScroll', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw when resource is missing', () => {
      expect(
        () =>
          new ResourceScroll(
            null as unknown as ResourceScrollInterface<Item, Criteria>
          )
      ).toThrow('ResourceScroll.constructor() requires a resource');
    });
  });

  describe('search', () => {
    it('should persist criteria and call gateway.search with them', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({
          items: [{ id: 1 }],
          page: 1,
          hasMore: true
        })
      );
      const scroll = new ResourceScroll<Item, Criteria>({ search });
      await scroll.search({ page: 1, pageSize: 10 });
      expect(search).toHaveBeenCalledWith({ page: 1, pageSize: 10 }, undefined);
      expect(scroll.getStore().getState().criteria).toEqual({
        page: 1,
        pageSize: 10
      });
    });

    it('should restore criteria after gateway rejection', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({
          items: [{ id: 1 }]
        })
      );
      const scroll = new ResourceScroll<Item, Criteria>({ search });
      await scroll.search({ page: 1, pageSize: 10 });
      search.mockRejectedValueOnce(new Error('x'));
      await expect(scroll.search({ page: 9, pageSize: 10 })).rejects.toThrow(
        'x'
      );
      expect(scroll.getStore().getState().criteria).toEqual({
        page: 1,
        pageSize: 10
      });
      expect(scroll.getStore().getState().status).toBe(AsyncStoreStatus.FAILED);
    });
  });

  describe('loadFirst', () => {
    it('should clear cursor and set page to 1 before calling search', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({
          items: [],
          hasMore: false
        })
      );
      const scroll = new ResourceScroll<Item, Criteria>({ search });
      await scroll.loadFirst({
        page: 5,
        pageSize: 10,
        cursor: 'old'
      });
      expect(search).toHaveBeenCalledWith(
        { page: 1, pageSize: 10, cursor: null },
        undefined
      );
    });
  });

  describe('loadNext', () => {
    it('should use nextCursor from last result when criteria are omitted', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({
          items: [{ id: 2 }],
          nextCursor: 'c2',
          hasMore: true
        })
      );
      const scroll = new ResourceScroll<Item, Criteria>({ search });
      await scroll.search({ page: 1, pageSize: 10, cursor: null });
      search.mockResolvedValueOnce({
        items: [{ id: 3 }],
        hasMore: true
      });
      await scroll.loadNext();
      expect(search).toHaveBeenLastCalledWith(
        { page: 1, pageSize: 10, cursor: 'c2' },
        undefined
      );
    });

    it('should increment page when nextCursor is absent and hasMore is not false', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({
          items: [{ id: 1 }],
          page: 1,
          hasMore: true
        })
      );
      const scroll = new ResourceScroll<Item, Criteria>({ search });
      await scroll.search({ page: 1, pageSize: 10 });
      await scroll.loadNext();
      expect(search).toHaveBeenLastCalledWith(
        { page: 2, pageSize: 10, cursor: null },
        undefined
      );
    });

    it('should throw synchronously when hasMore is false', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({
          items: [],
          hasMore: false
        })
      );
      const scroll = new ResourceScroll<Item, Criteria>({ search });
      await scroll.search({ page: 1, pageSize: 10 });
      expect(() => {
        scroll.loadNext();
      }).toThrow('hasMore is false');
    });

    it('should throw synchronously when criteria exist but result window is missing', () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({ items: [] })
      );
      const scroll = new ResourceScroll<Item, Criteria>(
        { search },
        { store: { criteria: { page: 1, pageSize: 10 } } }
      );
      expect(() => {
        scroll.loadNext();
      }).toThrow('needs a prior successful window');
    });
  });

  describe('refresh', () => {
    it('should repeat stored criteria when called without arguments', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => ({ items: [] })
      );
      const scroll = new ResourceScroll<Item, Criteria>(
        { search },
        {
          store: {
            criteria: { page: 2, pageSize: 5, cursor: 'x' }
          }
        }
      );
      await scroll.refresh();
      expect(search).toHaveBeenCalledWith(
        { page: 2, pageSize: 5, cursor: 'x' },
        undefined
      );
    });
  });

  describe('response validation', () => {
    it('should reject when strict guard fails on gateway result', async () => {
      const search = vi.fn(
        async () => ({ items: null }) as unknown as ResourceSearchResult<Item>
      );
      const scroll = new ResourceScroll<Item, Criteria>(
        { search },
        { store: { criteria: { page: 1 } } }
      );
      await expect(scroll.refresh()).rejects.toThrow('invalid response');
    });
  });
});
