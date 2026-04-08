/**
 * ResourceSearchStore / ResourceSearchStoreState test suite
 *
 * Coverage:
 * 1. ResourceSearchStoreState – defaults and constructor options (criteria preservation)
 * 2. ResourceSearchStore      – setCriteria, patchCriteria, pagination/keyword helpers
 */

import { describe, expect, it } from 'vitest';
import {
  ResourceSearchStore,
  ResourceSearchStoreState
} from '../../src/core/resources/impl/ResourceSearchStore';

type ListCriteria = {
  page?: number;
  pageSize?: number;
  keyword?: string;
  extra?: string;
};

describe('ResourceSearchStore module', () => {
  describe('ResourceSearchStoreState', () => {
    describe('constructor', () => {
      it('should default criteria to null and stage arrays to empty when options omitted', () => {
        const state = new ResourceSearchStoreState<{ id: string }>();
        expect(state.criteria).toBeNull();
        expect(state.stageRefs).toEqual([]);
        expect(state.stageItems).toEqual([]);
      });

      it('should preserve criteria from options (subclass field order vs super assign)', () => {
        const state = new ResourceSearchStoreState({
          criteria: { page: 3 }
        });
        expect(state.criteria).toEqual({ page: 3 });
      });
    });
  });

  describe('ResourceSearchStore', () => {
    function createStoreWithCriteria() {
      return new ResourceSearchStore<{ id: number }, ListCriteria>(
        'testSearch',
        {
          defaultState: () =>
            new ResourceSearchStoreState({
              criteria: { page: 1, pageSize: 10 }
            })
        }
      );
    }

    describe('setCriteria', () => {
      it('should replace the stored criteria snapshot', () => {
        const store = createStoreWithCriteria();
        store.setCriteria({ page: 5, pageSize: 20 });
        expect(store.getState().criteria).toEqual({ page: 5, pageSize: 20 });
      });
    });

    describe('patchCriteria', () => {
      it('should shallow-merge partial fields into current criteria', () => {
        const store = createStoreWithCriteria();
        store.patchCriteria({ page: 2 });
        expect(store.getState().criteria).toEqual({ page: 2, pageSize: 10 });
      });

      it('should use an empty object base when current criteria is null', () => {
        const store = new ResourceSearchStore<unknown, ListCriteria>('x', {
          defaultState: () => new ResourceSearchStoreState({ criteria: null })
        });
        store.patchCriteria({ page: 1, extra: 'y' });
        expect(store.getState().criteria).toEqual({ page: 1, extra: 'y' });
      });
    });

    describe('setPage, setPageSize, setKeyword', () => {
      it('should delegate to patchCriteria', () => {
        const store = createStoreWithCriteria();
        store.setPage(9);
        store.setPageSize(50);
        store.setKeyword('q');
        expect(store.getState().criteria).toEqual({
          page: 9,
          pageSize: 50,
          keyword: 'q'
        });
      });
    });
  });
});
