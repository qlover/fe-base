/**
 * ResourceSearch test suite
 *
 * Coverage:
 * 1. constructor   – requires gateway resource
 * 2. search        – replaces criteria, calls gateway, commits result
 * 3. refresh       – repeats or patches criteria; page reset when pageSize changes; stale-while-revalidate
 * 4. error paths   – missing criteria, failed search rolls back criteria, invalid response shape
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { AsyncStoreStatus } from '../../src/core/store-state';
import { ResourceSearch } from '../../src/core/resources/impl/ResourceSearch';
import type {
  ResourceSearchInterface,
  ResourceSearchResult
} from '../../src/core/resources/interfaces/ResourceSearchInterface';

type Criteria = { page?: number; pageSize?: number; keyword?: string };
type Item = { id: number };

const DEFAULT_CRITERIA: Criteria = { page: 1, pageSize: 10 };

function createOkResult(
  items: Item[] = [{ id: 1 }]
): ResourceSearchResult<Item> {
  return { items, page: 1, pageSize: 10, total: 1 };
}

describe('ResourceSearch', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw when resource is missing', () => {
      expect(
        () =>
          new ResourceSearch(
            null as unknown as ResourceSearchInterface<Item, Criteria>
          )
      ).toThrow('ResourceSearch.constructor() requires a resource');
    });
  });

  describe('search', () => {
    it('should replace criteria, invoke gateway with full criteria, and set success', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => createOkResult()
      );
      const svc = new ResourceSearch<Item, Criteria>(
        { search },
        { store: { criteria: DEFAULT_CRITERIA } }
      );
      const res = await svc.search({ page: 2, pageSize: 10 });
      expect(res.items).toHaveLength(1);
      expect(search).toHaveBeenCalledWith({ page: 2, pageSize: 10 }, undefined);
      expect(svc.getStore().getState().criteria).toEqual({
        page: 2,
        pageSize: 10
      });
      expect(svc.getStore().getState().status).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should restore previous criteria when gateway rejects', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => createOkResult()
      );
      const svc = new ResourceSearch<Item, Criteria>(
        { search },
        { store: { criteria: DEFAULT_CRITERIA } }
      );
      await svc.search({ page: 2, pageSize: 10 });
      search.mockRejectedValueOnce(new Error('boom'));
      await expect(svc.search({ page: 9, pageSize: 10 })).rejects.toThrow(
        'boom'
      );
      expect(svc.getStore().getState().criteria).toEqual({
        page: 2,
        pageSize: 10
      });
      expect(svc.getStore().getState().status).toBe(AsyncStoreStatus.FAILED);
    });
  });

  describe('refresh', () => {
    it('should repeat stored criteria when called without a patch', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => createOkResult()
      );
      const svc = new ResourceSearch<Item, Criteria>(
        { search },
        { store: { criteria: { page: 3, pageSize: 5 } } }
      );
      await svc.refresh();
      expect(search).toHaveBeenCalledWith({ page: 3, pageSize: 5 }, undefined);
    });

    it('should throw synchronously when no criteria exist in the store', () => {
      const search = vi.fn();
      const svc = new ResourceSearch<Item, Criteria>({ search });
      expect(() => {
        svc.refresh();
      }).toThrow('ResourceSearch.refresh() requires criteria');
      expect(search).not.toHaveBeenCalled();
    });

    it('should reset page to 1 when patch changes pageSize', async () => {
      const search = vi.fn(
        async (): Promise<ResourceSearchResult<Item>> => createOkResult()
      );
      const svc = new ResourceSearch<Item, Criteria>(
        { search },
        { store: { criteria: { page: 4, pageSize: 10 } } }
      );
      await svc.refresh({ page: 4, pageSize: 20 });
      expect(search).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, undefined);
      expect(svc.getStore().getState().criteria).toEqual({
        page: 1,
        pageSize: 20
      });
    });

    it('should keep prior result visible while loading (refresh operation)', async () => {
      let resolveSearch!: (v: ResourceSearchResult<Item>) => void;
      const search = vi.fn(
        () =>
          new Promise<ResourceSearchResult<Item>>((resolve) => {
            resolveSearch = resolve;
          })
      );
      const first = createOkResult([{ id: 1 }]);
      const svc = new ResourceSearch<Item, Criteria>(
        { search },
        {
          store: {
            criteria: DEFAULT_CRITERIA,
            result: first,
            status: AsyncStoreStatus.SUCCESS
          }
        }
      );
      const pending = svc.refresh();
      expect(svc.getStore().getState().loading).toBe(true);
      expect(svc.getStore().getState().result?.items).toEqual([{ id: 1 }]);
      resolveSearch(createOkResult([{ id: 2 }]));
      await pending;
      expect(svc.getStore().getState().result?.items).toEqual([{ id: 2 }]);
    });
  });

  describe('response validation', () => {
    it('should reject when default strict guard fails on gateway result', async () => {
      const search = vi.fn(
        async () => ({ items: 'no' }) as unknown as ResourceSearchResult<Item>
      );
      const svc = new ResourceSearch<Item, Criteria>(
        { search },
        { store: { criteria: { page: 1 } } }
      );
      await expect(svc.refresh()).rejects.toThrow('invalid response');
    });
  });
});
