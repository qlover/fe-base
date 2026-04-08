/**
 * ResourceIO test suite
 *
 * Coverage:
 * 1. constructor – requires gateway resource
 * 2. importData / exportData – success paths and correct store status
 * 3. isImportResult / isExportResult – invalid payload rejects and marks store failed
 * 4. gateway errors – propagates rejection and store.failed on the right slice
 * 5. getStore / getStoreInterface – default import store vs exportData store
 * 6. custom identifiers – merged with defaults for guard failures
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { AsyncStoreStatus } from '../../src/core/store-state';
import {
  ResourceIO,
  type ResourceIOIdentifiers
} from '../../src/core/resources/impl/ResourceIO';
import type { ResourceIOInterface } from '../../src/core/resources/interfaces/ResourceIOInterface';
import type { ResourceSearchParams } from '../../src/core/resources/interfaces/ResourceSearchInterface';

type Payload = { rows: string[] };
type Criteria = ResourceSearchParams & { tag?: string };

function createMockGateway(): ResourceIOInterface<Payload, Criteria> & {
  importData: ReturnType<typeof vi.fn>;
  exportData: ReturnType<typeof vi.fn>;
} {
  return {
    importData: vi.fn(async () => ({ status: 'ok', count: 1 })),
    exportData: vi.fn(async () => ({ status: 'ok', body: 'csv' }))
  };
}

describe('ResourceIO', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should throw when resource is missing', () => {
      expect(
        () =>
          new ResourceIO(null as unknown as ResourceIOInterface<Payload, Criteria>)
      ).toThrow('ResourceIO requires a resource');
    });
  });

  describe('importData', () => {
    it('should update import store to success and return gateway result', async () => {
      const gateway = createMockGateway();
      const io = new ResourceIO(gateway);
      const payload: Payload = { rows: ['a'] };
      const out = await io.importData(payload);
      expect(out).toEqual({ status: 'ok', count: 1 });
      expect(gateway.importData).toHaveBeenCalledWith(payload);
      expect(io.getStore('importData').getState().status).toBe(
        AsyncStoreStatus.SUCCESS
      );
      expect(io.getStore('importData').getState().result).toEqual(out);
    });

    it('should reject and mark import store failed when isImportResult returns false', async () => {
      const gateway = createMockGateway();
      gateway.importData.mockResolvedValue({ notStatus: true });
      const io = new ResourceIO(gateway, {
        isImportResult: (v): v is { status: string } =>
          typeof v === 'object' &&
          v !== null &&
          'status' in v &&
          typeof (v as { status: unknown }).status === 'string'
      });
      await expect(io.importData({ rows: [] })).rejects.toThrow(
        'Invalid import result'
      );
      expect(io.getStore('importData').getState().status).toBe(
        AsyncStoreStatus.FAILED
      );
    });

    it('should use custom identifier message when guard fails', async () => {
      const gateway = createMockGateway();
      gateway.importData.mockResolvedValue({});
      const identifiers: ResourceIOIdentifiers = {
        INVALID_IMPORT_RESULT: 'bad import',
        INVALID_EXPORT_RESULT: 'Invalid export result'
      };
      const io = new ResourceIO(gateway, {
        isImportResult: (v): v is { status: string } =>
          typeof v === 'object' &&
          v !== null &&
          typeof (v as { status?: unknown }).status === 'string',
        identifiers
      });
      await expect(io.importData({ rows: [] })).rejects.toThrow('bad import');
    });
  });

  describe('exportData', () => {
    it('should update export store to success and return gateway result', async () => {
      const gateway = createMockGateway();
      const io = new ResourceIO(gateway);
      const scope: Criteria = { page: 1, pageSize: 10 };
      const out = await io.exportData(scope);
      expect(out).toEqual({ status: 'ok', body: 'csv' });
      expect(gateway.exportData).toHaveBeenCalledWith(scope);
      expect(io.getStore('exportData').getState().status).toBe(
        AsyncStoreStatus.SUCCESS
      );
      expect(io.getStore('exportData').getState().result).toEqual(out);
    });

    it('should not mutate import store when only export runs', async () => {
      const gateway = createMockGateway();
      const io = new ResourceIO(gateway);
      await io.exportData({ pageSize: 5 });
      expect(io.getStore('importData').getState().status).toBe(
        AsyncStoreStatus.DRAFT
      );
    });

    it('should reject and mark export store failed when isExportResult returns false', async () => {
      const gateway = createMockGateway();
      gateway.exportData.mockResolvedValue(null);
      const io = new ResourceIO(gateway, {
        isExportResult: (v): v is { status: string } =>
          typeof v === 'object' &&
          v !== null &&
          'status' in v &&
          typeof (v as { status: unknown }).status === 'string'
      });
      await expect(io.exportData({})).rejects.toThrow('Invalid export result');
      expect(io.getStore('exportData').getState().status).toBe(
        AsyncStoreStatus.FAILED
      );
    });
  });

  describe('error handling', () => {
    it('should propagate import rejection and set import store to failed', async () => {
      const gateway = createMockGateway();
      const err = new Error('upload failed');
      gateway.importData.mockRejectedValue(err);
      const io = new ResourceIO(gateway);
      await expect(io.importData({ rows: [] })).rejects.toBe(err);
      expect(io.getStore('importData').getState().status).toBe(
        AsyncStoreStatus.FAILED
      );
    });

    it('should propagate export rejection and set export store to failed', async () => {
      const gateway = createMockGateway();
      const err = new Error('export failed');
      gateway.exportData.mockRejectedValue(err);
      const io = new ResourceIO(gateway);
      await expect(io.exportData({ page: 1 })).rejects.toBe(err);
      expect(io.getStore('exportData').getState().status).toBe(
        AsyncStoreStatus.FAILED
      );
    });
  });

  describe('getStore', () => {
    it('should default to importData store when called with no args', () => {
      const io = new ResourceIO(createMockGateway());
      expect(io.getStore()).toBe(io.getStore('importData'));
    });
  });

  describe('getStoreInterface', () => {
    it('should expose StoreInterface for import and export stores', () => {
      const io = new ResourceIO(createMockGateway());
      const imp = io.getStoreInterface('importData');
      const exp = io.getStoreInterface('exportData');
      expect(typeof imp.getState).toBe('function');
      expect(typeof imp.subscribe).toBe('function');
      expect(typeof exp.getState).toBe('function');
      expect(typeof exp.subscribe).toBe('function');
    });
  });
});
