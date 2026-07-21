## `src/core/resources/impl/ResourceScroll` (Module)

**Type:** `module src/core/resources/impl/ResourceScroll`

---

### `ResourceScroll` (Class)

**Type:** `class ResourceScroll<TItem, Criteria>`

**Since:** `3.1.0`

Wraps [ResourceScrollInterface](../interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface) with async store state: [ResourceSearchStoreState.result](../../store-state/impl/AsyncStoreState.md#result-property) holds the
last window; [ResourceSearchStoreState.criteria](./ResourceSearchStore.md#criteria-property) tracks the request used for [ResourceScroll.refresh](#refresh-method),
[ResourceScroll.loadFirst](#loadfirst-method), and [ResourceScroll.loadNext](#loadnext-method) when arguments are omitted.

**Remarks:**

This class implements [ResourceScrollInterface](../interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface) on the outside but **only calls**
[ResourceSearchInterface.search](../interfaces/ResourceSearchInterface.md#search-method) on the inner `resource` (typed as [ResourceSearchInterface](../interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface)).
Adapters that also implement [ResourceScrollInterface](../interfaces/ResourceScrollInterface.md#resourcescrollinterface-interface) are accepted; any custom `loadNext` / `loadFirst` /
`refresh` on the inner object is **not** invoked—scroll semantics are driven by this wrapper’s criteria
normalization and stored state.

**Example:** First page then infinite append

```typescript
const feed = new ResourceScroll(api, { serviceName: 'feed' });
await feed.loadFirst({ pageSize: 10, keyword: 'ts' });
await feed.loadNext(); // uses nextCursor or page+1 from the last result
await feed.refresh(); // same slice/cursor as last successful request
```

---

#### `constructor` (Constructor)

**Type:** `(resource: ResourceSearchInterface<TItem, Criteria>, options: Partial<ResourceScrollOptions<TItem, Criteria>>) => ResourceScroll<TItem, Criteria>`

#### Parameters

| Name                                                                | Type                                              | Optional | Default | Since | Deprecated | Description                                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `resource`                                                          | `ResourceSearchInterface<TItem, Criteria>`        | ❌       | -       | -     | -          | Gateway exposing at least [ResourceSearchInterface.search](../interfaces/ResourceSearchInterface.md#search-method); extra scroll methods on the |
| same object are **not** called by this wrapper (see class remarks). |
| `options`                                                           | `Partial<ResourceScrollOptions<TItem, Criteria>>` | ✅       | -       | -     | -          | Same shape as ResourceSearch (`serviceName`, store seed, response guard, logger)                                                                |

---

#### `gateway` (Property)

**Type:** `ResourceSearchInterface<TItem, Criteria>`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).
Protected to allow subclasses to access while preventing external modification.

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for logging execution events

Used for logging execution flow, errors, and debugging information.
Optional - services can work without logger.
Protected to allow subclasses to access while preventing external modification.

---

#### `serviceName` (Property)

**Type:** `GatewayServiceName`

Service name identifier

Used for logging, debugging, and service identification.
Set during construction and remains constant throughout the service lifecycle.

---

#### `store` (Property)

**Type:** `ResourceSearchStore`

Store instance for state management

The async store that manages service state (loading, success, error).
Always initialized - created from provided instance or options, or defaults to new store.
Protected to allow subclasses to access while preventing external modification.

---

#### `getGateway` (Method)

**Type:** `() => ResourceSearchInterface<TItem, Criteria> \| undefined`

---

##### `getGateway` (CallSignature)

**Type:** `ResourceSearchInterface<TItem, Criteria> \| undefined`

Get the gateway instance

Returns the gateway instance used by this service for API operations.
Returns `undefined` if no gateway was configured.

**Returns:**

The gateway instance, or `undefined` if not configured

**Example:** Access gateway methods

```typescript
const gateway = service.getGateway();
if (gateway) {
  await gateway.login(params);
}
```

**Example:** Check if gateway is available

```typescript
const gateway = service.getGateway();
if (!gateway) {
  console.warn('Gateway not configured');
}
```

---

#### `getLogger` (Method)

**Type:** `() => LoggerInterface<unknown> \| undefined`

---

##### `getLogger` (CallSignature)

**Type:** `LoggerInterface<unknown> \| undefined`

Get the logger instance

Returns the logger instance used by this service for logging.
Returns `undefined` if no logger was configured.

**Returns:**

The logger instance, or `undefined` if not configured

**Example:** Use logger for logging

```typescript
const logger = service.getLogger();
if (logger) {
  logger.info('Service operation started');
  logger.error('Service operation failed', error);
}
```

---

#### `getStore` (Method)

**Type:** `() => ResourceSearchStore<TItem, Criteria>`

---

##### `getStore` (CallSignature)

**Type:** `ResourceSearchStore<TItem, Criteria>`

---

#### `getStoreInterface` (Method)

**Type:** `() => StoreInterface<ResourceSearchStoreState<TItem, Criteria>>`

---

##### `getStoreInterface` (CallSignature)

**Type:** `StoreInterface<ResourceSearchStoreState<TItem, Criteria>>`

Subscribe to scroll/search state: async lifecycle + [ResourceSearchStoreState.criteria](./ResourceSearchStore.md#criteria-property).

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

First window for the current scope. With `criteria`, normalizes to a fresh window (clears cursor, `page` → 1).
Without `criteria`, uses stored criteria from a prior call or constructor defaults.

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

Next window. With `criteria`, runs that request and updates stored criteria on success. Without `criteria`,
advances from the last successful result (`nextCursor` or `page + 1` when `hasMore` is not `false`); stored
`criteria` is not advanced until the request succeeds (stays aligned with `result` if the call fails).

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `normalizeFirstWindowCriteria` (Method)

**Type:** `(criteria: Criteria) => Criteria`

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `criteria` | `Criteria` | ❌       | -       | -     | -          |             |

---

##### `normalizeFirstWindowCriteria` (CallSignature)

**Type:** `Criteria`

Derive a “first page” request: clear continuation and set `page` to **1** (1-based convention).
Zero-based page APIs must normalize in their own adapter or avoid relying on `page` for the first window.

#### Parameters

| Name       | Type       | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `criteria` | `Criteria` | ❌       | -       | -     | -          |             |

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

Re-run the current request. With `criteria`, stores and runs it as-is. Without `criteria`, repeats the last stored
criteria (including cursor / page).

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `requireStoredCriteria` (Method)

**Type:** `(method: string) => Criteria`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `method` | `string` | ❌       | -       | -     | -          |             |

---

##### `requireStoredCriteria` (CallSignature)

**Type:** `Criteria`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `method` | `string` | ❌       | -       | -     | -          |             |

---

#### `resolveNextCriteria` (Method)

**Type:** `(base: Criteria, lastWindow: ResourceSearchResult<TItem> \| null \| undefined) => Criteria`

#### Parameters

| Name         | Type                                               | Optional | Default | Since | Deprecated | Description |
| ------------ | -------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `base`       | `Criteria`                                         | ❌       | -       | -     | -          |             |
| `lastWindow` | `ResourceSearchResult<TItem> \| null \| undefined` | ❌       | -       | -     | -          |             |

---

##### `resolveNextCriteria` (CallSignature)

**Type:** `Criteria`

Derive the next window from the last response and current stored criteria.

#### Parameters

| Name         | Type                                               | Optional | Default | Since | Deprecated | Description |
| ------------ | -------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `base`       | `Criteria`                                         | ❌       | -       | -     | -          |             |
| `lastWindow` | `ResourceSearchResult<TItem> \| null \| undefined` | ❌       | -       | -     | -          |             |

---

#### `runSearch` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions \| undefined, criteriaRollback: Criteria \| null, operation: "refresh" \| "loadFirst" \| "loadNext" \| "search") => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name               | Type                                                 | Optional | Default | Since | Deprecated | Description |
| ------------------ | ---------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`         | `Criteria`                                           | ❌       | -       | -     | -          |             |
| `resourceOptions`  | `ResourceGatewayOptions \| undefined`                | ❌       | -       | -     | -          |             |
| `criteriaRollback` | `Criteria \| null`                                   | ❌       | -       | -     | -          |             |
| `operation`        | `"refresh" \| "loadFirst" \| "loadNext" \| "search"` | ❌       | -       | -     | -          |             |

---

##### `runSearch` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

Commits `criteria` only after success; on failure restores `criteriaRollback` (same idea as ResourceSearch).

#### Parameters

| Name               | Type                                                 | Optional | Default | Since | Deprecated | Description |
| ------------------ | ---------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`         | `Criteria`                                           | ❌       | -       | -     | -          |             |
| `resourceOptions`  | `ResourceGatewayOptions \| undefined`                | ❌       | -       | -     | -          |             |
| `criteriaRollback` | `Criteria \| null`                                   | ❌       | -       | -     | -          |             |
| `operation`        | `"refresh" \| "loadFirst" \| "loadNext" \| "search"` | ❌       | -       | -     | -          |             |

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

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ❌       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

### `ResourceScrollOptions` (TypeAlias)

**Type:** `Omit<GatewayServiceOptions<ResourceSearchResult<TItem>, ResourceSearchInterface<TItem, Criteria>>, "store"> & Object`

---
