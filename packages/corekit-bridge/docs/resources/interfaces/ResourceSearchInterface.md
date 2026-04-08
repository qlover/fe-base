## `src/core/resources/interfaces/ResourceSearchInterface` (Module)

**Type:** `module src/core/resources/interfaces/ResourceSearchInterface`

---

### `ResourceSearchInterface` (Interface)

**Type:** `interface ResourceSearchInterface<TItem, Criteria>`

**Since:** `3.1.0`

Port for browse/search: paged tables, filter changes, refresh (re-run with the same criteria), and cursor/infinite
scroll when Criteria and <a href="#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> carry cursor fields. Not for single-resource CRUD
(see ResourceCRUDInterface).

**Remarks:**

**Strengths**

- <a href="#resourcesearchparams-interface" class="tsd-kind-interface">ResourceSearchParams</a> lives in this module; ResourceSearchStore can keep `criteria` typed with the same shape.
- A single `search` method covers initial load, page changes, filter updates, and refresh (repeat the same `criteria`).
- <a href="#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> optional fields allow offset- and cursor-style APIs without forcing unused properties.
- Multi-field sorting uses <a href="#sort-property" class="tsd-kind-property">ResourceSearchParams.sort</a> (array of <a href="#resourcesortclause-interface" class="tsd-kind-interface">ResourceSortClause</a>).
- Base params already carry common knobs: <a href="#cursor-property" class="tsd-kind-property">ResourceSearchParams.cursor</a>, <a href="#offset-property" class="tsd-kind-property">ResourceSearchParams.offset</a>, <a href="#keyword-property" class="tsd-kind-property">ResourceSearchParams.keyword</a>, <a href="#filters-property" class="tsd-kind-property">ResourceSearchParams.filters</a>, plus <a href="#facets-property" class="tsd-kind-property">ResourceSearchResult.facets</a> / <a href="#meta-property" class="tsd-kind-property">ResourceSearchResult.meta</a> for rich responses.

**Limitations / caveats**

- Real products still need a richer `Criteria` (scopes, date ranges, `include` trees, locale, feature flags). Keep those on your extended type; this package only standardizes the portable core.
- `filters`, `facets`, and `meta` are intentionally `unknown`; narrow them per API or wrap `search` in your service layer.
- Semantics of `page` vs `offset`, `total`, `hasMore`, and cursor stability are not enforced; document per adapter.
- Optional <a href="#resourceoptions-typealias" class="tsd-kind-type-alias">ResourceOptions</a> on each call carries cross-cutting flags (e.g. `signal`); adapter-specific fields
  can be passed via intersection types at the app layer.
- No batching or incremental/streaming protocol beyond one `Promise` per call.
- Error shape, partial failures, and empty results are not modeled on the result type—use `Promise` rejection or wrapper types at the app layer if needed.
- One `search` call returns one page/window; “append vs replace” list state is a UI / ResourceSearchStore concern.

**Single `search` vs overloads / extra methods**

- This port keeps **one** `search` entry point: every scenario is “call `search` with the `criteria` you mean”
  (first load, filter change, same-params refresh, next cursor page). No stateful `search()` without arguments here.
- **Overloads are not required** on implementors; optional fields on <a href="#resourcesearchparams-interface" class="tsd-kind-interface">ResourceSearchParams</a> / `Criteria` carry
  the varying shapes instead of duplicate method signatures.
- **Shared `search` with ResourceScrollInterface:** same method name, `Criteria`, and return type
  <a href="#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a>—one implementation can implement both ports; infinite-scroll UIs simply ignore fields
  they do not need (`total`, `facets`, …).
- **No scroll helpers on this port:** table refresh is `search(criteria)`. For infinite lists,
  ResourceScrollInterface adds ResourceScrollInterface.loadNext, ResourceScrollInterface.loadFirst,
  and ResourceScrollInterface.refresh.
- **Stateful `ResourceSearch` (wrapper, not this port):** exposes `refresh(criteriaPatch?, resourceOptions?)` with the
  **same parameter shape** as ResourceScrollInterface.refresh, but a provided first argument is
  **`Partial<Criteria>`** and is **shallow-merged** into the store (`patchCriteria`); ResourceSearch.search
  **replaces** the snapshot. ResourceScroll.refresh uses **full** `Criteria` and **replaces** when given.

---

#### `search` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions) => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                                                                               |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------- |
| `criteria` | `Criteria` | ❌       | -       | -     | -          | **Full** query snapshot for this request. **Stateful ResourceSearch:** `search(criteria)` |

**replaces** stored criteria before the gateway call; use `refresh(partial?, resourceOptions?)` for shallow-merged
updates (same argument shape as ResourceScrollInterface.refresh). |
| `resourceOptions` | `ResourceGatewayOptions` | ✅ | - | - | - | Optional per-call flags (abort, tracing, etc.); implementations may ignore unknown fields. |

---

##### `search` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

Run one list/search request for the given criteria (initial load, changed filters, refresh, or next page/cursor).

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description                                                                               |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------- |
| `criteria` | `Criteria` | ❌       | -       | -     | -          | **Full** query snapshot for this request. **Stateful ResourceSearch:** `search(criteria)` |

**replaces** stored criteria before the gateway call; use `refresh(partial?, resourceOptions?)` for shallow-merged
updates (same argument shape as ResourceScrollInterface.refresh). |
| `resourceOptions` | `ResourceGatewayOptions` | ✅ | - | - | - | Optional per-call flags (abort, tracing, etc.); implementations may ignore unknown fields. |

---

### `ResourceSearchParams` (Interface)

**Type:** `interface ResourceSearchParams`

Shared search/list request fields used by <a href="#resourcesearchinterface-interface" class="tsd-kind-interface">ResourceSearchInterface</a> and ResourceSearchStore state (`criteria` / `searchParams` patterns).
Covers common pagination, sort, keyword, and opaque filter/cursor hooks; domain-specific query shapes should extend
this type (intersection / interface `extends`).

**Example:** Offset page + keyword + sort

```typescript
const params: ResourceSearchParams = {
  page: 1,
  pageSize: 20,
  keyword: 'acme',
  sort: [{ orderBy: 'createdAt', order: 'desc' }]
};
```

**Example:** Cursor-style request

```typescript
const next: ResourceSearchParams = {
  pageSize: 20,
  cursor: previous.nextCursor
};
```

**Remarks:**

Typical extensions on `Criteria` (not repeated on every app): date ranges, tag IDs, geo bounds, column visibility,
`include` / `expand` graph hints, locale, archive flags, soft-delete toggles, A/B flags, etc.—model those on your
`Criteria` type instead of bloating this base interface.

This type does **not** prescribe default `page` / `pageSize` / etc.; callers, stores, and API adapters choose and
document their own defaults when fields are omitted.

---

#### `cursor` (Property)

**Type:** `null \| string`

Opaque cursor from a prior <a href="#nextcursor-property" class="tsd-kind-property">ResourceSearchResult.nextCursor</a> (infinite scroll / keyset pagination).

---

#### `filters` (Property)

**Type:** `unknown`

Structured filters (field conditions, tag sets, JSON tree, DSL string — API-specific).

---

#### `keyword` (Property)

**Type:** `string`

Global free-text query (table search box, site search, etc.).

---

#### `offset` (Property)

**Type:** `number`

Skip N rows before returning results; used by APIs that prefer `offset`+`limit` or combine with `page`.

---

#### `page` (Property)

**Type:** `number`

Current page number for offset pagination (1-based vs 0-based is API-defined). Omitted until caller/impl sets it.

---

#### `pageSize` (Property)

**Type:** `number`

Page / window size (max rows per response). Omitted until caller/impl sets it.

---

#### `sort` (Property)

**Type:** `property sort`

Ordered sort levels (primary first). Single-field sort uses a one-element array. Omit for server default order.

---

### `ResourceSearchResult` (Interface)

**Type:** `interface ResourceSearchResult<T>`

One page or window of search results. Field usage depends on the backend (offset vs cursor vs hybrid).

**Remarks:**

Heavy response payloads (highlight snippets, inner hits, per-row scores, suggested queries) usually belong on `T` or
on a wrapper list item type, or under <a href="#meta-property" class="tsd-kind-property">ResourceSearchResult.meta</a> / app-specific result types—not every API
fits this flat shape.
ResourceScrollInterface reuses this type; lightweight scroll endpoints may leave `total`, `facets`, etc. unset.

---

#### `facets` (Property)

**Type:** `unknown`

Facet / aggregation buckets for filter UI (counts per category, price ranges, etc.); shape is API-specific.

---

#### `hasMore` (Property)

**Type:** `boolean`

Optional hint when the API does not use opaque cursors.

---

#### `items` (Property)

**Type:** `property items`

---

#### `meta` (Property)

**Type:** `unknown`

Opaque envelope (request id, took/ms, echoed criteria, warnings, debug). Avoid coupling core types to one vendor.

---

#### `nextCursor` (Property)

**Type:** `null \| string`

Next request cursor for infinite scroll / keyset pagination; omit or `null` when no next page.

---

#### `page` (Property)

**Type:** `number`

Current page index (echo or canonical; 0- vs 1-based is API-defined).

---

#### `pageSize` (Property)

**Type:** `number`

Page size used for this response.

---

#### `prevCursor` (Property)

**Type:** `null \| string`

Previous window cursor when the API supports backward pagination.

---

#### `total` (Property)

**Type:** `number`

Total matching rows when the API supports it (classic pagination / “X of Y”).

---

### `ResourceSortClause` (Interface)

**Type:** `interface ResourceSortClause`

One sort level: field name plus optional direction/config (API-specific).

**Example:** Single field descending

```typescript
{ orderBy: 'createdAt', order: 'desc' }
```

---

#### `order` (Property)

**Type:** `unknown`

Sort direction or backend-specific order config

**Example:**

```ts
`'asc'` | `'desc'` | { direction: 'asc', nulls: 'last' };
```

---

#### `orderBy` (Property)

**Type:** `string`

Field / column to sort by

**Example:**

```ts
`'createdAt'` | `'name'` | `'id'`;
```

---

### `ResourceOptions` (TypeAlias)

**Type:** `ResourceGatewayOptions`

Per-call options for list/search/scroll adapters (e.g. <a href="./ResourceCRUDInterface.md#signal-property" class="tsd-kind-property">ResourceGatewayOptions.signal</a> for cancellation).
Same shape as <a href="./ResourceCRUDInterface.md#resourcegatewayoptions-typealias" class="tsd-kind-type-alias">ResourceGatewayOptions</a>; intersect with app-specific types at the call site for typed extras.

---
