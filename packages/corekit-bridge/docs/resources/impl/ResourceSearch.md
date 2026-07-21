## `src/core/resources/impl/ResourceSearch` (Module)

**Type:** `module src/core/resources/impl/ResourceSearch`

---

### `ResourceSearch` (Class)

**Type:** `class ResourceSearch<TItem, Criteria>`

**Since:** `3.1.0`

Wraps [ResourceSearchInterface](../interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface) with async store state. [ResourceSearchStoreState.result](../../store-state/impl/AsyncStoreState.md#result-property) holds the last
[ResourceSearchResult](../interfaces/ResourceSearchInterface.md#resourcesearchresult-interface) (including `items`); [ResourceSearchStoreState.criteria](./ResourceSearchStore.md#criteria-property) holds query params for
[ResourceSearch.refresh](#refresh-method) and incremental updates via [ResourceSearchStore.patchCriteria](./ResourceSearchStore.md#patchcriteria-method) on [ResourceSearch.getStore](#getstore-method).

**Remarks:**

- [search](#search-method) **replaces** stored criteria with the argument snapshot before calling the gateway.
- [refresh](#refresh-method) optionally **shallow-merges** a `Partial<Criteria>`; omit the argument to repeat the last snapshot.

**Example:** Table: full criteria on filter change, partial merge on page size change

```typescript
const list = new ResourceSearch(gateway, { serviceName: 'orders' });
await list.search({ page: 1, pageSize: 20, keyword: 'paid' });
await list.refresh({ pageSize: 50 }); // keeps keyword, resets page when size changes (see implementation)
```

---

#### `constructor` (Constructor)

**Type:** `(resource: ResourceSearchInterface<TItem, Criteria>, options: Partial<ResourceSearchOptions<TItem, Criteria>>) => ResourceSearch<TItem, Criteria>`

#### Parameters

| Name                                                                                   | Type                                              | Optional | Default | Since | Deprecated | Description                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `resource`                                                                             | `ResourceSearchInterface<TItem, Criteria>`        | ❌       | -       | -     | -          | Bare [ResourceSearchInterface](../interfaces/ResourceSearchInterface.md#resourcesearchinterface-interface) implementation      |
| `options`                                                                              | `Partial<ResourceSearchOptions<TItem, Criteria>>` | ✅       | -       | -     | -          | `serviceName`, logger, optional [ResourceSearchStore](./ResourceSearchStore.md#resourcesearchstore-class) / state seed, custom |
| [ResourceSearchOptions.isResourceSearchResult](#isresourcesearchresult-property) guard |

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

Subscribe to full search state: async lifecycle + [ResourceSearchStoreState.criteria](./ResourceSearchStore.md#criteria-property).

---

#### `refresh` (Method)

**Type:** `(criteriaPatch: Partial<Criteria>, resourceOptions: ResourceGatewayOptions) => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteriaPatch`   | `Partial<Criteria>`      | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `refresh` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

Same parameter shape as ResourceScrollInterface.refresh: optional criteria, optional [ResourceOptions](../interfaces/ResourceSearchInterface.md#resourceoptions-typealias).

**Unlike** ResourceScroll.refresh: when `criteriaPatch` is provided it is **`Partial<Criteria>`** and
**shallow-merged** via [ResourceSearchStore.patchCriteria](./ResourceSearchStore.md#patchcriteria-method) (omit keys stay as in the store). When omitted,
repeats the current stored snapshot. When both `page` and `pageSize` are numbers in the patch, and `pageSize` changes
vs the previous criteria or last result, `page` is forced to `1` before the merge (typical table UX).

**Throws:**

When no criteria have been set (constructor `defaultCriteria`, setCriteria, or a prior [search](#search-method)).

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteriaPatch`   | `Partial<Criteria>`      | ✅       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `runSearch` (Method)

**Type:** `(criteria: Criteria, resourceOptions: ResourceGatewayOptions \| undefined, criteriaRollback: Criteria \| null, operation: "refresh" \| "search") => Promise<ResourceSearchResult<TItem>>`

#### Parameters

| Name               | Type                                  | Optional | Default | Since | Deprecated | Description |
| ------------------ | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`         | `Criteria`                            | ❌       | -       | -     | -          |             |
| `resourceOptions`  | `ResourceGatewayOptions \| undefined` | ❌       | -       | -     | -          |             |
| `criteriaRollback` | `Criteria \| null`                    | ❌       | -       | -     | -          |             |
| `operation`        | `"refresh" \| "search"`               | ❌       | -       | -     | -          |             |

---

##### `runSearch` (CallSignature)

**Type:** `Promise<ResourceSearchResult<TItem>>`

Commits `criteria` only after a successful response; on failure restores `criteriaRollback` so
[ResourceSearchStoreState.criteria](./ResourceSearchStore.md#criteria-property) stays aligned with the last successful [ResourceSearchStoreState.result](../../store-state/impl/AsyncStoreState.md#result-property).

#### Parameters

| Name               | Type                                  | Optional | Default | Since | Deprecated | Description |
| ------------------ | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`         | `Criteria`                            | ❌       | -       | -     | -          |             |
| `resourceOptions`  | `ResourceGatewayOptions \| undefined` | ❌       | -       | -     | -          |             |
| `criteriaRollback` | `Criteria \| null`                    | ❌       | -       | -     | -          |             |
| `operation`        | `"refresh" \| "search"`               | ❌       | -       | -     | -          |             |

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

**Remarks:**

**Replaces** [ResourceSearchStoreState.criteria](./ResourceSearchStore.md#criteria-property) with `criteria`. For the same two-argument shape
with **partial** merge, use [refresh](#refresh-method).

#### Parameters

| Name              | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria`        | `Criteria`               | ❌       | -       | -     | -          |             |
| `resourceOptions` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

### `ResourceSearchOptions` (TypeAlias)

**Type:** `Omit<GatewayServiceOptions<ResourceSearchResult<TItem>, ResourceSearchInterface<TItem, Criteria>>, "store"> & Object`

---
