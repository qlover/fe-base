/**
 * @module Resources
 * @description Resource ports, type guards, and gateway wrappers for CRUD, search/list, scroll, and bulk I/O
 *
 * This barrel groups **contracts** (`ResourceCRUDInterface`, `ResourceSearchInterface`, `ResourceScrollInterface`,
 * `ResourceIOInterface`), **lifecycle hooks** ({@link LifecycleInterface}), **shared DTOs** (`ResourceSearchParams` and
 * {@link ResourceSearchResult} from the search module; bulk import/export shapes on {@link ResourceIOInterface}), and
 * **concrete services** that wrap a gateway with async store state ({@link ResourceCRUD}, {@link ResourceSearch},
 * {@link ResourceScroll}, {@link ResourceIO}) plus their stores. **Runtime guards** {@link isResourceSearchResult} and
 * {@link isResourceSearchResultStrict} live in `./ResourceSearchResult.ts` (narrow unknown list/search payloads).
 *
 * ### Exported members (high level)
 *
 * - **Lifecycle:** {@link LifecycleInterface} — `created` / `updated` / `destroyed` hooks for services or UI shells.
 * - **CRUD port:** {@link ResourceCRUDInterface}, {@link RefType}, {@link ResourceGatewayOptions} — detail, create, update, remove.
 * - **Search port:** {@link ResourceSearchInterface}, {@link ResourceSearchParams}, {@link ResourceSearchResult},
 *   {@link ResourceSortClause}, {@link ResourceOptions} — one `search(criteria)` per window.
 * - **Scroll port:** {@link ResourceScrollInterface} — `search`, `loadFirst`, `loadNext`, `refresh` with optional stored criteria.
 * - **Bulk I/O port:** {@link ResourceIOInterface}, {@link ResourceImportBody}, {@link ResourceInResult}, {@link ResourceOutResult}.
 * - **Runtime guards:** {@link isResourceSearchResult}, {@link isResourceSearchResultStrict} — narrow unknown API payloads.
 * - **Wrappers:** {@link ResourceCRUD}, {@link ResourceCRUDStore}, {@link ResourceSearch}, {@link ResourceSearchStore},
 *   {@link ResourceScroll}, {@link ResourceIO} — adapters built on the gateway-service base class with loading/error state for UI binding.
 *
 * ### Basic usage
 *
 * ```typescript
 * import {
 *   ResourceCRUD,
 *   ResourceSearch,
 *   type ResourceCRUDInterface,
 *   type ResourceSearchInterface
 * } from '@qlover/corekit-bridge';
 *
 * // Implement ports against your HTTP layer, then wrap for store-backed loading state.
 * const crud = new ResourceCRUD(
 *   myUserGateway satisfies ResourceCRUDInterface<User>,
 *   { serviceName: 'users' }
 * );
 * const list = new ResourceSearch(
 *   myUserListGateway satisfies ResourceSearchInterface<UserRow>,
 *   { serviceName: 'userList' }
 * );
 *
 * await crud.detail('42');
 * await list.search({ page: 1, pageSize: 20 });
 * ```
 *
 * ### Related documentation
 *
 * Paths are relative to `docs/resources/` (same layout as `pnpm build:docs` / `fe-code2md` for this package).
 *
 * - [LifecycleInterface](./LifecycleInterface.md)
 * - [ResourceSearchResult](./ResourceSearchResult.md) — list/search result guards
 * - Port contracts: [ResourceCRUDInterface](./interfaces/ResourceCRUDInterface.md), [ResourceSearchInterface](./interfaces/ResourceSearchInterface.md), [ResourceScrollInterface](./interfaces/ResourceScrollInterface.md), [ResourceIOInterface](./interfaces/ResourceIOInterface.md)
 * - Wrappers: [ResourceCRUD](./impl/ResourceCRUD.md), [ResourceCRUDStore](./impl/ResourceCRUDStore.md), [ResourceSearch](./impl/ResourceSearch.md), [ResourceSearchStore](./impl/ResourceSearchStore.md), [ResourceScroll](./impl/ResourceScroll.md), [ResourceIO](./impl/ResourceIO.md)
 *
 * @see {@link ResourceCRUDInterface}
 * @see {@link ResourceSearchInterface}
 * @see {@link ResourceScrollInterface}
 * @see {@link ResourceIOInterface}
 * @see {@link ResourceIO}
 */
export * from './LifecycleInterface';
export * from './interfaces/ResourceCRUDInterface';
export * from './interfaces/ResourceIOInterface';
export * from './interfaces/ResourceSearchInterface';
export * from './ResourceSearchResult';
export * from './interfaces/ResourceScrollInterface';
export * from './impl/ResourceCRUD';
export * from './impl/ResourceCRUDStore';
export * from './impl/ResourceSearch';
export * from './impl/ResourceSearchStore';
export * from './impl/ResourceScroll';
export * from './impl/ResourceIO';
