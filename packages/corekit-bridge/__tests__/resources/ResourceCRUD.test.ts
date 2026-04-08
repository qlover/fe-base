/**
 * ResourceCRUD test suite
 *
 * Coverage:
 * 1. constructor           – requires gateway resource
 * 2. create / detail / update / remove – success paths and store status
 * 3. isResourceResult      – invalid payload rejects and marks store failed
 * 4. gateway errors        – propagates rejection and store.failed
 * 5. getStore / getStoreInterface – wiring for UI binding
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { AsyncStoreStatus } from '../../src/core/store-state';
import { ResourceCRUD } from '../../src/core/resources/impl/ResourceCRUD';
import type { ResourceCRUDInterface } from '../../src/core/resources/interfaces/ResourceCRUDInterface';

interface T {
  id: number;
  name: string;
}

function createMockGateway(): ResourceCRUDInterface<T> & {
  create: ReturnType<typeof vi.fn>;
  detail: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
} {
  return {
    create: vi.fn(async (payload: T) => ({ ...payload, id: 1 })),
    detail: vi.fn(async () => ({ id: 1, name: 'd' })),
    update: vi.fn(async () => ({ id: 1, name: 'u' })),
    remove: vi.fn(async () => undefined)
  };
}

describe('ResourceCRUD', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw when resource is missing', () => {
      expect(
        () => new ResourceCRUD(null as unknown as ResourceCRUDInterface<T>)
      ).toThrow('ResourceCRUD requires a resource');
    });
  });

  describe('create', () => {
    it('should update create store to success and return gateway result', async () => {
      const gateway = createMockGateway();
      const crud = new ResourceCRUD(gateway);
      const out = await crud.create({ id: 0, name: 'n' });
      expect(out).toEqual({ id: 1, name: 'n' });
      expect(crud.getStore('create').getState().status).toBe(
        AsyncStoreStatus.SUCCESS
      );
      expect(crud.getStore('create').getState().result).toEqual(out);
    });

    it('should reject and mark store failed when isResourceResult returns false', async () => {
      const gateway = createMockGateway();
      gateway.create.mockResolvedValue({ bad: true });
      const crud = new ResourceCRUD(gateway, {
        isResourceResult: (v): v is T =>
          typeof v === 'object' &&
          v !== null &&
          'id' in v &&
          typeof (v as T).id === 'number'
      });
      await expect(crud.create({ id: 0, name: 'n' })).rejects.toThrow(
        'Invalid Resource'
      );
      expect(crud.getStore('create').getState().status).toBe(
        AsyncStoreStatus.FAILED
      );
    });
  });

  describe('detail', () => {
    it('should call gateway with ref and update detail store on success', async () => {
      const gateway = createMockGateway();
      const crud = new ResourceCRUD(gateway);
      await crud.detail('ref-1');
      expect(gateway.detail).toHaveBeenCalledWith('ref-1', undefined);
      expect(crud.getStore('detail').getState().result).toEqual({
        id: 1,
        name: 'd'
      });
    });
  });

  describe('update', () => {
    it('should pass ref, payload, and options to gateway and set success on update store', async () => {
      const gateway = createMockGateway();
      const crud = new ResourceCRUD(gateway);
      await crud.update(1, { id: 1, name: 'patch' });
      expect(gateway.update).toHaveBeenCalledWith(
        1,
        { id: 1, name: 'patch' },
        undefined
      );
      expect(crud.getStore('update').getState().status).toBe(
        AsyncStoreStatus.SUCCESS
      );
    });
  });

  describe('remove', () => {
    it('should resolve void, call gateway, and set remove store success with null result', async () => {
      const gateway = createMockGateway();
      const crud = new ResourceCRUD(gateway);
      await crud.remove('x');
      expect(gateway.remove).toHaveBeenCalledWith('x', undefined);
      expect(crud.getStore('remove').getState().status).toBe(
        AsyncStoreStatus.SUCCESS
      );
      expect(crud.getStore('remove').getState().result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should propagate gateway rejection and set create store to failed', async () => {
      const gateway = createMockGateway();
      const err = new Error('net');
      gateway.create.mockRejectedValue(err);
      const crud = new ResourceCRUD(gateway);
      await expect(crud.create({ id: 0, name: 'n' })).rejects.toBe(err);
      expect(crud.getStore('create').getState().status).toBe(
        AsyncStoreStatus.FAILED
      );
    });
  });

  describe('getStoreInterface', () => {
    it('should expose StoreInterface with getState and subscribe', () => {
      const crud = new ResourceCRUD(createMockGateway());
      const iface = crud.getStoreInterface('detail');
      expect(typeof iface.getState).toBe('function');
      expect(typeof iface.subscribe).toBe('function');
    });
  });
});
