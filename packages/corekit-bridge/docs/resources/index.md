## `Resources` (Module)

**Type:** `module Resources`

Resource ports, type guards, and gateway wrappers for CRUD, search/list, scroll, and bulk I/O

This barrel groups **contracts** (`ResourceCRUDInterface`, `ResourceSearchInterface`, `ResourceScrollInterface`,
`ResourceIOInterface`), **lifecycle hooks** (<a href="./LifecycleInterface.md#lifecycleinterface-interface" class="tsd-kind-interface">LifecycleInterface</a>), **shared DTOs** (`ResourceSearchParams` and
<a href="./interfaces/ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> from the search module; bulk import/export shapes on <a href="./interfaces/ResourceIOInterface.md#resourceiointerface-interface" class="tsd-kind-interface">ResourceIOInterface</a>), and
**concrete services** that wrap a gateway with async store state (<a href="./impl/ResourceCRUD.md#resourcecrud-class" class="tsd-kind-class">ResourceCRUD</a>, <a href="./impl/ResourceSearch.md#resourcesearch-class" class="tsd-kind-class">ResourceSearch</a>,
<a href="./impl/ResourceScroll.md#resourcescroll-class" class="tsd-kind-class">ResourceScroll</a>, <a href="./impl/ResourceIO.md#resourceio-class" class="tsd-kind-class">ResourceIO</a>) plus their stores. **Runtime guards** <a href="./ResourceSearchResult.md#isresourcesearchresult-function" class="tsd-kind-function">isResourceSearchResult</a> and
<a href="./ResourceSearchResult.md#isresourcesearchresultstrict-function" class="tsd-kind-function">isResourceSearchResultStrict</a> live in `./ResourceSearchResult.ts` (narrow unknown list/search payloads).

### Exported members (high level)

- **Lifecycle:** <a href="./LifecycleInterface.md#lifecycleinterface-interface" class="tsd-kind-interface">LifecycleInterface</a> — `created` / `updated` / `destroyed` hooks for services or UI shells.
- **CRUD port:** <a href="./interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface" class="tsd-kind-interface">ResourceCRUDInterface</a>, <a href="./interfaces/ResourceCRUDInterface.md#reftype-typealias" class="tsd-kind-type-alias">RefType</a>, <a href="./interfaces/ResourceCRUDInterface.md#resourcegatewayoptions-typealias" class="tsd-kind-type-alias">ResourceGatewayOptions</a> — detail, create, update, remove.
- **Search port:** <a href="./interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface" class="tsd-kind-interface">ResourceSearchInterface</a>, <a href="./interfaces/ResourceSearchInterface.md#resourcesearchparams-interface" class="tsd-kind-interface">ResourceSearchParams</a>, <a href="./interfaces/ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a>,
  <a href="./interfaces/ResourceSearchInterface.md#resourcesortclause-interface" class="tsd-kind-interface">ResourceSortClause</a>, <a href="./interfaces/ResourceSearchInterface.md#resourceoptions-typealias" class="tsd-kind-type-alias">ResourceOptions</a> — one `search(criteria)` per window.
- **Scroll port:** <a href="./interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface" class="tsd-kind-interface">ResourceScrollInterface</a> — `search`, `loadFirst`, `loadNext`, `refresh` with optional stored criteria.
- **Bulk I/O port:** <a href="./interfaces/ResourceIOInterface.md#resourceiointerface-interface" class="tsd-kind-interface">ResourceIOInterface</a>, <a href="./interfaces/ResourceIOInterface.md#resourceimportbody-typealias" class="tsd-kind-type-alias">ResourceImportBody</a>, <a href="./interfaces/ResourceIOInterface.md#resourceinresult-interface" class="tsd-kind-interface">ResourceInResult</a>, <a href="./interfaces/ResourceIOInterface.md#resourceoutresult-interface" class="tsd-kind-interface">ResourceOutResult</a>.
- **Runtime guards:** <a href="./ResourceSearchResult.md#isresourcesearchresult-function" class="tsd-kind-function">isResourceSearchResult</a>, <a href="./ResourceSearchResult.md#isresourcesearchresultstrict-function" class="tsd-kind-function">isResourceSearchResultStrict</a> — narrow unknown API payloads.
- **Wrappers:** <a href="./impl/ResourceCRUD.md#resourcecrud-class" class="tsd-kind-class">ResourceCRUD</a>, <a href="./impl/ResourceCRUDStore.md#resourcecrudstore-class" class="tsd-kind-class">ResourceCRUDStore</a>, <a href="./impl/ResourceSearch.md#resourcesearch-class" class="tsd-kind-class">ResourceSearch</a>, <a href="./impl/ResourceSearchStore.md#resourcesearchstore-class" class="tsd-kind-class">ResourceSearchStore</a>,
  <a href="./impl/ResourceScroll.md#resourcescroll-class" class="tsd-kind-class">ResourceScroll</a>, <a href="./impl/ResourceIO.md#resourceio-class" class="tsd-kind-class">ResourceIO</a> — adapters built on the gateway-service base class with loading/error state for UI binding.

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

- <a href="./interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface" class="tsd-kind-interface">ResourceCRUDInterface</a>
- <a href="./interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface" class="tsd-kind-interface">ResourceSearchInterface</a>
- <a href="./interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface" class="tsd-kind-interface">ResourceScrollInterface</a>
- <a href="./interfaces/ResourceIOInterface.md#resourceiointerface-interface" class="tsd-kind-interface">ResourceIOInterface</a>
- <a href="./impl/ResourceIO.md#resourceio-class" class="tsd-kind-class">ResourceIO</a>

---
