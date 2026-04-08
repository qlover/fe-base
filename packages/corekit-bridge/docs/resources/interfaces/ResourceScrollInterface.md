## `src/core/resources/interfaces/ResourceScrollInterface` (Module)

**Type:** `module src/core/resources/interfaces/ResourceScrollInterface`

---

### `ResourceScrollInterface` (Interface)

**Type:** `interface ResourceScrollInterface<TItem, Criteria>`

**Since:** `3.1.0`

Port for **incremental** lists: same <a href="./ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> and `Criteria extends {@link ResourceSearchParams}` as
ResourceSearchInterface. **`search`** is the explicit entry (required `criteria`). **`loadNext`**, **`loadFirst`**,
and **`refresh`** are shortcuts whose `criteria` may be **omitted** when the implementation holds the last query state
(e.g. a service field or store).

**Remarks:**

**Semantics**

- <a href="#search-method" class="tsd-kind-method">search</a> — always pass `criteria` (same contract as ResourceSearchInterface.search).
- <a href="#loadnext-method" class="tsd-kind-method">loadNext</a> — next chunk. With `criteria`: caller supplies continuation. **Without `criteria`:** implementation
  uses stored state (last `search` / prior chunk) and advances continuation itself; must `reject` if no state exists.
- <a href="#loadfirst-method" class="tsd-kind-method">loadFirst</a> — first chunk for the scope. With `criteria`: normalize that object (strip `cursor`, reset page).
  **Without `criteria`:** use stored base filters/keyword/pageSize and load the first page.
- <a href="#refresh-method" class="tsd-kind-method">refresh</a> — same slice again. With `criteria`: run it unchanged. **Without `criteria`:** re-run the last
  request parameters exactly (including `cursor` / `page` if stored).
- Stateless adapters should require arguments for the three shortcuts (TypeScript cannot enforce—document or reject at runtime).
- Hard errors reject the `Promise`. Debounce and intersection observers stay in UI code.
- Optional <a href="./ResourceSearchInterface.md#resourceoptions-typealias" class="tsd-kind-type-alias">ResourceOptions</a> (`resourceOptions`) on each method mirrors ResourceSearchInterface.search.

**Example:** Calling the port from UI (criteria optional only when the adapter holds state)

```typescript
// First load: pass full criteria.
await scroll.search({ pageSize: 20, keyword: 'news' });
// Infinite scroll: omit criteria so the implementation advances from the last window.
await scroll.loadNext(undefined, { signal: controller.signal });
// Pull-to-refresh: repeat the last stored request.
await scroll.refresh();
```

---

#### `loadFirst` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions) => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `loadFirst` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

First window for this scope. Pass `criteria` to derive scope from, or omit to use stored scope.

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `loadNext` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions) => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `loadNext` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

Next window. Pass `criteria` with continuation from the last <a href="./ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a>, or omit to use
implementation-held state.

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `refresh` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions) => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `refresh` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

Re-query the current slice. Pass `criteria` to run as-is, or omit to repeat the last stored request.

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `search` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions) => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ❌       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `search` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

One window for the given `criteria` (required). Same as ResourceSearchInterface.search.

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ❌       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---
