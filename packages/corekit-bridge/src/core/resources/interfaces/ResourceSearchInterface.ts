/**
 * One sort level: field name plus optional direction/config (API-specific).
 *
 * @example Single field descending
 * ```typescript
 * { orderBy: 'createdAt', order: 'desc' }
 * ```
 */
export interface ResourceSortClause {
  /**
   * Field / column to sort by
   *
   * @example `'createdAt'` | `'name'` | `'id'`
   */
  orderBy: string;

  /**
   * Sort direction or backend-specific order config
   *
   * @example `'asc'` | `'desc'` | { direction: 'asc', nulls: 'last' }
   */
  order?: unknown;
}

/**
 * Shared search/list request fields used by {@link ResourceSearchInterface} and {@link ResourceStore} `searchParams`.
 * Covers common pagination, sort, keyword, and opaque filter/cursor hooks; domain-specific query shapes should extend
 * this type (intersection / interface `extends`).
 *
 * @example Offset page + keyword + sort
 * ```typescript
 * const params: ResourceSearchParams = {
 *   page: 1,
 *   pageSize: 20,
 *   keyword: 'acme',
 *   sort: [{ orderBy: 'createdAt', order: 'desc' }]
 * };
 * ```
 *
 * @example Cursor-style request
 * ```typescript
 * const next: ResourceSearchParams = { pageSize: 20, cursor: previous.nextCursor };
 * ```
 *
 * @remarks
 * Typical extensions on `Criteria` (not repeated on every app): date ranges, tag IDs, geo bounds, column visibility,
 * `include` / `expand` graph hints, locale, archive flags, soft-delete toggles, A/B flags, etc.—model those on your
 * `Criteria` type instead of bloating this base interface.
 *
 * This type does **not** prescribe default `page` / `pageSize` / etc.; callers, stores, and API adapters choose and
 * document their own defaults when fields are omitted.
 */
export interface ResourceSearchParams {
  /**
   * Current page number for offset pagination (1-based vs 0-based is API-defined). Omitted until caller/impl sets it.
   */
  page?: number;

  /**
   * Page / window size (max rows per response). Omitted until caller/impl sets it.
   */
  pageSize?: number;

  /**
   * Skip N rows before returning results; used by APIs that prefer `offset`+`limit` or combine with `page`.
   */
  offset?: number;

  /**
   * Opaque cursor from a prior {@link ResourceSearchResult.nextCursor} (infinite scroll / keyset pagination).
   */
  cursor?: string | null;

  /**
   * Global free-text query (table search box, site search, etc.).
   */
  keyword?: string;

  /**
   * Structured filters (field conditions, tag sets, JSON tree, DSL string — API-specific).
   */
  filters?: unknown;

  /**
   * Ordered sort levels (primary first). Single-field sort uses a one-element array. Omit for server default order.
   */
  sort?: readonly ResourceSortClause[];
}

/**
 * One page or window of search results. Field usage depends on the backend (offset vs cursor vs hybrid).
 *
 * @typeParam T - Row / list item type (often aligned with list rows used next to {@link ResourceCRUDInterface})
 *
 * @remarks
 * Heavy response payloads (highlight snippets, inner hits, per-row scores, suggested queries) usually belong on `T` or
 * on a wrapper list item type, or under {@link ResourceSearchResult.meta} / app-specific result types—not every API
 * fits this flat shape.
 * {@link ResourceScrollInterface} reuses this type; lightweight scroll endpoints may leave `total`, `facets`, etc. unset.
 */
export interface ResourceSearchResult<T> {
  readonly items: readonly T[];

  /** Total matching rows when the API supports it (classic pagination / “X of Y”). */
  total?: number;

  /** Current page index (echo or canonical; 0- vs 1-based is API-defined). */
  page?: number;

  /** Page size used for this response. */
  pageSize?: number;

  /** Next request cursor for infinite scroll / keyset pagination; omit or `null` when no next page. */
  nextCursor?: string | null;

  /** Previous window cursor when the API supports backward pagination. */
  prevCursor?: string | null;

  /** Optional hint when the API does not use opaque cursors. */
  hasMore?: boolean;

  /**
   * Facet / aggregation buckets for filter UI (counts per category, price ranges, etc.); shape is API-specific.
   */
  facets?: unknown;

  /**
   * Opaque envelope (request id, took/ms, echoed criteria, warnings, debug). Avoid coupling core types to one vendor.
   */
  meta?: unknown;
}

/**
 * Port for browse/search: paged tables, filter changes, refresh (re-run with the same criteria), and cursor/infinite
 * scroll when {@link Criteria} and {@link ResourceSearchResult} carry cursor fields. Not for single-resource CRUD
 * (see {@link ResourceCRUDInterface}).
 *
 * @typeParam TItem - Each row in {@link ResourceSearchResult.items}
 * @typeParam Criteria - Search input; must include (or be) {@link ResourceSearchParams} fields; extend with filters, keyword, cursor, etc.
 *
 * @remarks
 * **Strengths**
 * - {@link ResourceSearchParams} lives in this module; {@link ResourceStore} can keep `searchParams` typed with the same shape.
 * - A single `search` method covers initial load, page changes, filter updates, and refresh (repeat the same `criteria`).
 * - {@link ResourceSearchResult} optional fields allow offset- and cursor-style APIs without forcing unused properties.
 * - Multi-field sorting uses {@link ResourceSearchParams.sort} (array of {@link ResourceSortClause}).
 * - Base params already carry common knobs: {@link ResourceSearchParams.cursor}, {@link ResourceSearchParams.offset}, {@link ResourceSearchParams.keyword}, {@link ResourceSearchParams.filters}, plus {@link ResourceSearchResult.facets} / {@link ResourceSearchResult.meta} for rich responses.
 *
 * **Limitations / caveats**
 * - Real products still need a richer `Criteria` (scopes, date ranges, `include` trees, locale, feature flags). Keep those on your extended type; this package only standardizes the portable core.
 * - `filters`, `facets`, and `meta` are intentionally `unknown`; narrow them per API or wrap `search` in your service layer.
 * - Semantics of `page` vs `offset`, `total`, `hasMore`, and cursor stability are not enforced; document per adapter.
 * - No batching, cancellation, or incremental/streaming protocol in this interface.
 * - Error shape, partial failures, and empty results are not modeled on the result type—use `Promise` rejection or wrapper types at the app layer if needed.
 * - One `search` call returns one page/window; “append vs replace” list state is a UI/{@link ResourceStore} concern.
 *
 * **Single `search` vs overloads / extra methods**
 * - This port keeps **one** `search` entry point: every scenario is “call `search` with the `criteria` you mean”
 *   (first load, filter change, same-params refresh, next cursor page). No stateful `search()` without arguments here.
 * - **Overloads are not required** on implementors; optional fields on {@link ResourceSearchParams} / `Criteria` carry
 *   the varying shapes instead of duplicate method signatures.
 * - **Shared `search` with {@link ResourceScrollInterface}:** same method name, `Criteria`, and return type
 *   {@link ResourceSearchResult}—one implementation can implement both ports; infinite-scroll UIs simply ignore fields
 *   they do not need (`total`, `facets`, …).
 * - **No scroll helpers on this port:** table refresh is `search(criteria)`. For infinite lists,
 *   {@link ResourceScrollInterface} adds {@link ResourceScrollInterface.loadNext}, {@link ResourceScrollInterface.loadFirst},
 *   and {@link ResourceScrollInterface.refresh}.
 */
export interface ResourceSearchInterface<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
> {
  /**
   * Run one list/search request for the given criteria (initial load, changed filters, refresh, or next page/cursor).
   *
   * @param criteria - Full query state; defaults for omitted fields are defined by the implementation or caller, not by this type.
   */
  search(criteria: Criteria): Promise<ResourceSearchResult<TItem>>;
}
