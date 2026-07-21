## `Resources` (Module)

**Type:** `module Resources`

Resource ports, type guards, and gateway wrappers for CRUD, search/list, scroll, and bulk I/O

This barrel groups **contracts** (`ResourceCRUDInterface`, `ResourceSearchInterface`, `ResourceScrollInterface`,
`ResourceIOInterface`), **lifecycle hooks** ([LifecycleInterface](./LifecycleInterface.md#lifecycleinterface-interface)), **shared DTOs** (`ResourceSearchParams` and
[ResourceSearchResult](./interfaces/ResourceSearchInterface.md#resourcesearchresult-interface) from the search module; bulk import/export shapes on [ResourceIOInterface](./interfaces/ResourceIOInterface.md#resourceiointerface-interface)), and
**concrete services** that wrap a gateway with async store state ([ResourceCRUD](./impl/ResourceCRUD.md#resourcecrud-class), [ResourceSearch](./impl/ResourceSearch.md#resourcesearch-class),
[ResourceScroll](./impl/ResourceScroll.md#resourcescroll-class), [ResourceIO](./impl/ResourceIO.md#resourceio-class)) plus their stores. **Runtime guards** [isResourceSearchResult](./ResourceSearchResult.md#isresourcesearchresult-function) and
[isResourceSearchResultStrict](./ResourceSearchResult.md#isresourcesearchresultstrict-function) live in `./ResourceSearchResult.ts` (narrow unknown list/search payloads).

### Exported members (high level)

- **Lifecycle:** [LifecycleInterface](./LifecycleInterface.md#lifecycleinterface-interface) — `created` / `updated` / `destroyed` hooks for services or UI shells.
- **CRUD port:** [ResourceCRUDInterface](./interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface), [RefType](./interfaces/ResourceCRUDInterface.md#reftype-typealias), [ResourceGatewayOptions](./interfaces/ResourceCRUDInterface.md#resourcegatewayoptions-typealias) — detail, create, update, remove.
- **Search port:** [ResourceSearchInterface](./interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface), [ResourceSearchParams](./interfaces/ResourceSearchInterface.md#resourcesearchparams-interface), [ResourceSearchResult](./interfaces/ResourceSearchInterface.md#resourcesearchresult-interface),
  [ResourceSortClause](./interfaces/ResourceSearchInterface.md#resourcesortclause-interface), [ResourceOptions](./interfaces/ResourceSearchInterface.md#resourceoptions-typealias) — one `search(criteria)` per window.
- **Scroll port:** [ResourceScrollInterface](./interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface) — `search`, `loadFirst`, `loadNext`, `refresh` with optional stored criteria.
- **Bulk I/O port:** [ResourceIOInterface](./interfaces/ResourceIOInterface.md#resourceiointerface-interface), [ResourceImportBody](./interfaces/ResourceIOInterface.md#resourceimportbody-typealias), [ResourceInResult](./interfaces/ResourceIOInterface.md#resourceinresult-interface), [ResourceOutResult](./interfaces/ResourceIOInterface.md#resourceoutresult-interface).
- **Runtime guards:** [isResourceSearchResult](./ResourceSearchResult.md#isresourcesearchresult-function), [isResourceSearchResultStrict](./ResourceSearchResult.md#isresourcesearchresultstrict-function) — narrow unknown API payloads.
- **Wrappers:** [ResourceCRUD](./impl/ResourceCRUD.md#resourcecrud-class), [ResourceCRUDStore](./impl/ResourceCRUDStore.md#resourcecrudstore-class), [ResourceSearch](./impl/ResourceSearch.md#resourcesearch-class), [ResourceSearchStore](./impl/ResourceSearchStore.md#resourcesearchstore-class),
  [ResourceScroll](./impl/ResourceScroll.md#resourcescroll-class), [ResourceIO](./impl/ResourceIO.md#resourceio-class) — adapters built on the gateway-service base class with loading/error state for UI binding.

### Basic usage

```typescript
import {
  ResourceCRUD,
  ResourceSearch,
  type ResourceCRUDInterface,
  type ResourceSearchInterface
} from '@qlover/corekit-bridge';

// Implement ports against your HTTP layer, then wrap for store-backed loading state.
const crud = new ResourceCRUD(
  myUserGateway satisfies ResourceCRUDInterface<User>,
  { serviceName: 'users' }
);
const list = new ResourceSearch(
  myUserListGateway satisfies ResourceSearchInterface<UserRow>,
  { serviceName: 'userList' }
);

await crud.detail('42');
await list.search({ page: 1, pageSize: 20 });
```

### Related documentation

Paths are relative to `docs/resources/` (same layout as `pnpm build:docs` / `fe-code2md` for this package).

- [LifecycleInterface](./LifecycleInterface.md)
- [ResourceSearchResult](./ResourceSearchResult.md) — list/search result guards
- Port contracts: [ResourceCRUDInterface](./interfaces/ResourceCRUDInterface.md), [ResourceSearchInterface](./interfaces/ResourceSearchInterface.md), [ResourceScrollInterface](./interfaces/ResourceScrollInterface.md), [ResourceIOInterface](./interfaces/ResourceIOInterface.md)
- Wrappers: [ResourceCRUD](./impl/ResourceCRUD.md), [ResourceCRUDStore](./impl/ResourceCRUDStore.md), [ResourceSearch](./impl/ResourceSearch.md), [ResourceSearchStore](./impl/ResourceSearchStore.md), [ResourceScroll](./impl/ResourceScroll.md), [ResourceIO](./impl/ResourceIO.md)

**See:**

- [ResourceCRUDInterface](./interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface)
- [ResourceSearchInterface](./interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface)
- [ResourceScrollInterface](./interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface)
- [ResourceIOInterface](./interfaces/ResourceIOInterface.md#resourceiointerface-interface)
- [ResourceIO](./impl/ResourceIO.md#resourceio-class)

---
