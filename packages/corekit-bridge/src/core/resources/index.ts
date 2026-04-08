/**
 * @module Resources
 * @description Resource ports, type guards, and gateway wrappers for CRUD, search/list, scroll, and bulk I/O
 *
 * This barrel groups **contracts** (`ResourceCRUDInterface`, `ResourceSearchInterface`, `ResourceScrollInterface`,
 * `ResourceIOInterface`), **lifecycle hooks** ({@link LifecycleInterface}), **shared DTOs** (`ResourceSearchParams`,
 * `ResourceSearchResult`, import/export result types), and **concrete services** that wrap a gateway with async store
 * state ({@link ResourceCRUD}, {@link ResourceSearch}, {@link ResourceScroll}, {@link ResourceIO}) plus their stores.
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
 * const crud = new ResourceCRUD(myUserGateway satisfies ResourceCRUDInterface<User>, {
 *   serviceName: 'users'
 * });
 * const list = new ResourceSearch(myUserListGateway satisfies ResourceSearchInterface<UserRow>, {
 *   serviceName: 'userList'
 * });
 *
 * await crud.detail('42');
 * await list.search({ page: 1, pageSize: 20 });
 * ```
 *
 * ### Related documentation
 *
 * - [LifecycleInterface](../../../docs/resources/LifecycleInterface.md)
 * - [Resource interface overview](../../../docs/resources/ResourceInterface.md)
 * - [Resource store patterns](../../../docs/resources/ResourceStore.md)
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
