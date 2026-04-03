import type {
  ResourceSearchParams,
  ResourceSearchResult
} from './ResourceSearchInterface';

/**
 * Port for **incremental** lists: same {@link ResourceSearchResult} and `Criteria extends {@link ResourceSearchParams}` as
 * {@link ResourceSearchInterface}. **`search`** is the explicit entry (required `criteria`). **`loadNext`**, **`loadFirst`**,
 * and **`refresh`** are shortcuts whose `criteria` may be **omitted** when the implementation holds the last query state
 * (e.g. a service field or store).
 *
 * @typeParam TItem - Row or option shape.
 * @typeParam Criteria - Same as {@link ResourceSearchInterface}.
 *
 * @remarks
 * **Semantics**
 * - {@link search} — always pass `criteria` (same contract as {@link ResourceSearchInterface.search}).
 * - {@link loadNext} — next chunk. With `criteria`: caller supplies continuation. **Without `criteria`:** implementation
 *   uses stored state (last `search` / prior chunk) and advances continuation itself; must `reject` if no state exists.
 * - {@link loadFirst} — first chunk for the scope. With `criteria`: normalize that object (strip `cursor`, reset page).
 *   **Without `criteria`:** use stored base filters/keyword/pageSize and load the first page.
 * - {@link refresh} — same slice again. With `criteria`: run it unchanged. **Without `criteria`:** re-run the last
 *   request parameters exactly (including `cursor` / `page` if stored).
 * - Stateless adapters should require arguments for the three shortcuts (TypeScript cannot enforce—document or reject at runtime).
 * - Hard errors reject the `Promise`. Debounce and intersection observers stay in UI code.
 */
export interface ResourceScrollInterface<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
> {
  /**
   * One window for the given `criteria` (required). Same as {@link ResourceSearchInterface.search}.
   */
  search(criteria: Criteria): Promise<ResourceSearchResult<TItem>>;

  /**
   * Next window. Pass `criteria` with continuation from the last {@link ResourceSearchResult}, or omit to use
   * implementation-held state.
   */
  loadNext(criteria?: Criteria): Promise<ResourceSearchResult<TItem>>;

  /**
   * First window for this scope. Pass `criteria` to derive scope from, or omit to use stored scope.
   */
  loadFirst(criteria?: Criteria): Promise<ResourceSearchResult<TItem>>;

  /**
   * Re-query the current slice. Pass `criteria` to run as-is, or omit to repeat the last stored request.
   */
  refresh(criteria?: Criteria): Promise<ResourceSearchResult<TItem>>;
}
