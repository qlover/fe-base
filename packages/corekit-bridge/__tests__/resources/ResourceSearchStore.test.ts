/**
 * ResourceSearchStore / ResourceSearchStoreState test suite
 *
 * Coverage:
 * 1. ResourceSearchStoreState – defaults and constructor options (criteria preservation)
 * 2. ResourceSearchStore      – setCriteria, patchCriteria, pagination/keyword helpers
 * 3. Staging APIs             – stageRefs / stageItems helpers
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

    describe('stageRefs', () => {
      it('should setStageRefs replace the list', () => {
        const store = new ResourceSearchStore<{ id: number }, ListCriteria>(
          'staging',
          {
            defaultState: () =>
              new ResourceSearchStoreState({ stageRefs: ['a'] })
          }
        );
        store.setStageRefs([2, 3]);
        expect(store.getState().stageRefs).toEqual([2, 3]);
      });

      it('should addStageRef dedupe and removeStageRef drop matches', () => {
        const store = new ResourceSearchStore<unknown, ListCriteria>(
          'staging',
          {
            defaultState: () =>
              new ResourceSearchStoreState({ stageRefs: ['x'] })
          }
        );
        store.addStageRef('y');
        store.addStageRef('y');
        expect(store.getState().stageRefs).toEqual(['x', 'y']);
        store.removeStageRef('x');
        expect(store.getState().stageRefs).toEqual(['y']);
      });

      it('should clearStageRefs', () => {
        const store = new ResourceSearchStore<unknown, ListCriteria>(
          'staging',
          {
            defaultState: () =>
              new ResourceSearchStoreState({ stageRefs: [1, 2] })
          }
        );
        store.clearStageRefs();
        expect(store.getState().stageRefs).toEqual([]);
      });
    });

    describe('stageItems', () => {
      it('should setStageItems, addStageItem, removeStageItemAt', () => {
        const store = new ResourceSearchStore<{ id: number }, ListCriteria>(
          'staging',
          {
            defaultState: () =>
              new ResourceSearchStoreState({
                stageItems: [{ id: 1 }]
              })
          }
        );
        store.addStageItem({ id: 2 });
        expect(store.getState().stageItems).toEqual([{ id: 1 }, { id: 2 }]);
        store.removeStageItemAt(0);
        expect(store.getState().stageItems).toEqual([{ id: 2 }]);
        store.setStageItems([]);
        expect(store.getState().stageItems).toEqual([]);
      });

      it('should removeStageItem by predicate', () => {
        const store = new ResourceSearchStore<{ id: number }, ListCriteria>(
          'staging',
          {
            defaultState: () =>
              new ResourceSearchStoreState({
                stageItems: [{ id: 1 }, { id: 2 }]
              })
          }
        );
        store.removeStageItem((r) => r.id === 1);
        expect(store.getState().stageItems).toEqual([{ id: 2 }]);
      });

      it('should updateStageItemAt shallow-merge', () => {
        const store = new ResourceSearchStore<
          { id: number; name: string },
          ListCriteria
        >('staging', {
          defaultState: () =>
            new ResourceSearchStoreState({
              stageItems: [{ id: 1, name: 'a' }]
            })
        });
        store.updateStageItemAt(0, { name: 'b' });
        expect(store.getState().stageItems[0]).toEqual({ id: 1, name: 'b' });
      });

      it('should clearStageItems', () => {
        const store = new ResourceSearchStore<{ id: number }, ListCriteria>(
          'staging',
          {
            defaultState: () =>
              new ResourceSearchStoreState({
                stageItems: [{ id: 1 }]
              })
          }
        );
        store.clearStageItems();
        expect(store.getState().stageItems).toEqual([]);
      });
    });
  });
});
