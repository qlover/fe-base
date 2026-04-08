/**
 * createResourceSearchStore test suite
 *
 * Coverage:
 * 1. existing store passthrough – same ResourceSearchStore instance returned
 * 2. state options branch        – new ResourceSearchStore from partial initial state
 */

import { describe, expect, it } from 'vitest';
import { createResourceSearchStore } from '../../src/core/resources/impl/createResourceSearchStore';
import {
  ResourceSearchStore,
  ResourceSearchStoreState
} from '../../src/core/resources/impl/ResourceSearchStore';

describe('createResourceSearchStore', () => {
  describe('when store is already a ResourceSearchStore', () => {
    it('should return the same instance (ignore resourceName argument)', () => {
      const existing = new ResourceSearchStore<
        { id: number },
        { page?: number }
      >('svc', {
        defaultState: () =>
          new ResourceSearchStoreState({
            criteria: { page: 1 }
          })
      });
      const out = createResourceSearchStore('other', existing);
      expect(out).toBe(existing);
    });
  });

  describe('when store is initial state options', () => {
    it('should create a ResourceSearchStore with merged criteria and stage fields', () => {
      const store = createResourceSearchStore('listSvc', {
        criteria: { page: 2, pageSize: 5 },
        stageRefs: ['a'],
        stageItems: [{ id: 1 }]
      });
      expect(store).toBeInstanceOf(ResourceSearchStore);
      expect(store.resourceName).toBe('listSvc');
      const s = store.getState();
      expect(s.criteria).toEqual({ page: 2, pageSize: 5 });
      expect(s.stageRefs).toEqual(['a']);
      expect(s.stageItems).toEqual([{ id: 1 }]);
    });
  });
});
