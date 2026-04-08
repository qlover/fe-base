import type { ResourceSearchResult } from './interfaces/ResourceSearchInterface';

/**
 * Narrow `unknown` to {@link ResourceSearchResult} by requiring a non-null object with an array `items`.
 * Optional fields (`total`, `page`, cursors, `facets`, `meta`, …) are **not** validated.
 *
 * @param value - Arbitrary value (e.g. parsed JSON) from a list/search endpoint
 * @returns `true` when `value` is a non-null object with an `items` array (may be empty)
 *
 * @example Accept any object with an `items` array
 * ```typescript
 * const body: unknown = await res.json();
 * if (isResourceSearchResult<Row>(body)) {
 *   console.log(body.items.length);
 * }
 * ```
 */
export function isResourceSearchResult<T = unknown>(
  value: unknown,
): value is ResourceSearchResult<T> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('items' in value)) {
    return false;
  }
  return Array.isArray((value as { items: unknown }).items);
}

function isOptionalStringOrNull(v: unknown): boolean {
  return v === undefined || v === null || typeof v === 'string';
}

/**
 * Stricter variant of {@link isResourceSearchResult}: when optional keys exist, their **types** must match
 * {@link ResourceSearchResult} (`total` / `page` / `pageSize` as finite numbers, `nextCursor` / `prevCursor` as
 * `string | null | undefined`, `hasMore` as `boolean` when present). Does **not** inspect `facets` or `meta`.
 *
 * {@link ResourceSearch} uses this guard by default before committing to the store.
 *
 * @param value - Arbitrary value to validate
 * @returns `true` when the loose shape holds and present optional fields have correct types
 *
 * @example Default guard before trusting a gateway response
 * ```typescript
 * if (!isResourceSearchResultStrict<Row>(payload)) {
 *   throw new TypeError('Invalid search result');
 * }
 * ```
 */
export function isResourceSearchResultStrict<T = unknown>(
  value: unknown,
): value is ResourceSearchResult<T> {
  if (!isResourceSearchResult(value)) {
    return false;
  }
  const r = value as unknown as Record<string, unknown>;
  if (
    'total' in r &&
    r.total !== undefined &&
    (typeof r.total !== 'number' || !Number.isFinite(r.total))
  ) {
    return false;
  }
  if (
    'page' in r &&
    r.page !== undefined &&
    (typeof r.page !== 'number' || !Number.isFinite(r.page))
  ) {
    return false;
  }
  if (
    'pageSize' in r &&
    r.pageSize !== undefined &&
    (typeof r.pageSize !== 'number' || !Number.isFinite(r.pageSize))
  ) {
    return false;
  }
  if ('nextCursor' in r && !isOptionalStringOrNull(r.nextCursor)) {
    return false;
  }
  if ('prevCursor' in r && !isOptionalStringOrNull(r.prevCursor)) {
    return false;
  }
  if ('hasMore' in r && r.hasMore !== undefined && typeof r.hasMore !== 'boolean') {
    return false;
  }
  return true;
}
