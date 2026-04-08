/**
 * ResourceSearchResult type-guard test suite
 *
 * Coverage:
 * 1. isResourceSearchResult      – loose shape (object + items array)
 * 2. isResourceSearchResultStrict – optional field validation when present
 * 3. type narrowing               – expectTypeOf after guards (see testing-guide.md)
 */

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ResourceSearchResult } from '../../src/core/resources/interfaces/ResourceSearchInterface';
import {
  isResourceSearchResult,
  isResourceSearchResultStrict
} from '../../src/core/resources/ResourceSearchResult';

describe('ResourceSearchResult type guards', () => {
  describe('isResourceSearchResult', () => {
    it('should return false for non-objects, null, or non-array items', () => {
      expect(isResourceSearchResult(undefined)).toBe(false);
      expect(isResourceSearchResult(null)).toBe(false);
      expect(isResourceSearchResult(1)).toBe(false);
      expect(isResourceSearchResult('x')).toBe(false);
      expect(isResourceSearchResult({})).toBe(false);
      expect(isResourceSearchResult({ items: null })).toBe(false);
      expect(isResourceSearchResult({ items: {} })).toBe(false);
    });

    it('should return true when items is an array (invalid optional fields ignored)', () => {
      expect(isResourceSearchResult({ items: [] })).toBe(true);
      expect(
        isResourceSearchResult({
          items: [1, 2],
          total: 'oops' as unknown as number
        })
      ).toBe(true);
    });

    it('should narrow unknown to ResourceSearchResult when the guard passes', () => {
      const value: unknown = { items: [1, 2] };
      if (isResourceSearchResult<number>(value)) {
        expectTypeOf(value).toMatchTypeOf<ResourceSearchResult<number>>();
        expectTypeOf(value.items).toEqualTypeOf<readonly number[]>();
      }
    });
  });

  describe('isResourceSearchResultStrict', () => {
    it('should return false when loose guard fails', () => {
      expect(isResourceSearchResultStrict(null)).toBe(false);
      expect(isResourceSearchResultStrict({ items: 'nope' })).toBe(false);
    });

    it('should accept minimal valid result', () => {
      expect(isResourceSearchResultStrict({ items: [] })).toBe(true);
    });

    describe('optional numeric fields', () => {
      it('should reject non-finite numbers when total, page, or pageSize keys exist', () => {
        expect(isResourceSearchResultStrict({ items: [], total: NaN })).toBe(
          false
        );
        expect(
          isResourceSearchResultStrict({ items: [], page: Infinity })
        ).toBe(false);
        expect(
          isResourceSearchResultStrict({ items: [], pageSize: Number.NaN })
        ).toBe(false);
      });

      it('should accept finite numeric optional fields', () => {
        expect(
          isResourceSearchResultStrict({ items: [], total: 10, page: 1 })
        ).toBe(true);
      });
    });

    describe('optional cursor and hasMore', () => {
      it('should reject wrong types when keys are present', () => {
        expect(
          isResourceSearchResultStrict({
            items: [],
            nextCursor: 1 as unknown as string
          })
        ).toBe(false);
        expect(
          isResourceSearchResultStrict({
            items: [],
            prevCursor: [] as unknown as string
          })
        ).toBe(false);
        expect(
          isResourceSearchResultStrict({
            items: [],
            hasMore: 'yes' as unknown as boolean
          })
        ).toBe(false);
      });

      it('should accept string, null cursors and boolean hasMore', () => {
        expect(
          isResourceSearchResultStrict({
            items: [],
            nextCursor: null,
            prevCursor: 'a'
          })
        ).toBe(true);
        expect(isResourceSearchResultStrict({ items: [], hasMore: true })).toBe(
          true
        );
      });
    });

    it('should narrow unknown to ResourceSearchResult when strict guard passes', () => {
      const value: unknown = { items: [], total: 0 };
      if (isResourceSearchResultStrict<{ id: string }>(value)) {
        expectTypeOf(value).toMatchTypeOf<
          ResourceSearchResult<{ id: string }>
        >();
      }
    });
  });
});
