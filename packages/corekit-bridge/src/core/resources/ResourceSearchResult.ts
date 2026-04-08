import type { ResourceSearchResult } from './interfaces/ResourceSearchInterface';

/**
 * Narrow `unknown` to {@link ResourceSearchResult} by requiring a non-null object with an array `items`.
 * Optional fields are not validated.
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
 * Like {@link isResourceSearchResult}, but when optional keys are present their values must match the interface
 * (`total` / `page` / `pageSize` as finite numbers when present, `nextCursor` / `prevCursor` as string or null, `hasMore` as boolean).
 * Does not inspect `facets` or `meta`.
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
