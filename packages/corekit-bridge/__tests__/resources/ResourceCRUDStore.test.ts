/**
 * ResourceCRUDStore test suite
 *
 * Coverage:
 * 1. setActiveDetail    – emits activeDetail on state
 * 2. updateActiveDetail – no-op without activeDetail; clone + shallow merge when set
 */

import { describe, expect, it } from 'vitest';
import { ResourceCRUDStore } from '../../src/core/resources/impl/ResourceCRUDStore';

interface Row {
  id: number;
  name: string;
}

describe('ResourceCRUDStore', () => {
  describe('setActiveDetail', () => {
    it('should emit activeDetail into store state', () => {
      const store = new ResourceCRUDStore<Row>('user.detail');
      const row: Row = { id: 1, name: 'a' };
      store.setActiveDetail(row);
      expect(store.getState().activeDetail).toEqual(row);
    });
  });

  describe('updateActiveDetail', () => {
    it('should do nothing when activeDetail is unset', () => {
      const store = new ResourceCRUDStore<Row>('user.detail');
      store.updateActiveDetail({ name: 'b' });
      expect(store.getState().activeDetail).toBeUndefined();
    });

    it('should shallow-merge updates into a clone of activeDetail', () => {
      const store = new ResourceCRUDStore<Row>('user.detail');
      const original: Row = { id: 1, name: 'a' };
      store.setActiveDetail(original);
      store.updateActiveDetail({ name: 'b' });
      const next = store.getState().activeDetail;
      expect(next).toEqual({ id: 1, name: 'b' });
      expect(next).not.toBe(original);
    });
  });
});
