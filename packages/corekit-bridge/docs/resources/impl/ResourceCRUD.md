## `src/core/resources/impl/ResourceCRUD` (Module)

**Type:** `module src/core/resources/impl/ResourceCRUD`

---

### `ResourceCRUD` (Class)

**Type:** `class ResourceCRUD<T, Snapshot>`

**Since:** `3.1.0`

Wraps a [ResourceCRUDInterface](../interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface) implementation with async store state for UI binding.

Each operation (`create`, `detail`, `update`, `remove`) drives its own [ResourceCRUDStore](./ResourceCRUDStore.md#resourcecrudstore-class): `start` before the
gateway call, `success` / `failed` after. Use [getStore](#getstore-method) or [getStoreInterface](#getstoreinterface-method) to subscribe from components.

**Example:** Wire a gateway and read loading state from the detail store

```typescript
const users = new ResourceCRUD(userGateway, {
  serviceName: 'users',
  isResourceResult: (v): v is User => isUserDTO(v)
});
const detailStore = users.getStoreInterface('detail');
await users.detail('42');
```

---

#### `constructor` (Constructor)

**Type:** `(resource: ResourceCRUDInterface<T, Snapshot>, options: Partial<ResourceCRUDOptions<T, Snapshot>>) => ResourceCRUD<T, Snapshot>`

#### Parameters

| Name       | Type                                        | Optional | Default | Since | Deprecated | Description                                                                                                                              |
| ---------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `resource` | `ResourceCRUDInterface<T, Snapshot>`        | ❌       | -       | -     | -          | Bare [ResourceCRUDInterface](../interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface) implementation (HTTP, RPC, mock, …) |
| `options`  | `Partial<ResourceCRUDOptions<T, Snapshot>>` | ✅       | -       | -     | -          | `serviceName`, logging, custom stores, [ResourceCRUDOptions.isResourceResult](#isresourceresult-property), etc.                          |

---

#### `gateway` (Property)

**Type:** `ResourceCRUDInterface<T, Snapshot>`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).
Protected to allow subclasses to access while preventing external modification.

---

#### `identifiers` (Property)

**Type:** `Object`

---

##### `INVALIDE_RESOURCE` (Property)

**Type:** `string`

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

**Type:** `ResourceCRUDStore`

Store instance for state management

The async store that manages service state (loading, success, error).
Always initialized - created from provided instance or options, or defaults to new store.
Protected to allow subclasses to access while preventing external modification.

---

#### `storeMap` (Property)

**Type:** `Record<CRUDResourceName, ResourceCRUDStore<T>>`

---

#### `create` (Method)

**Type:** `(payload: T \| Snapshot, options: ResourceGatewayOptions) => Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                                                                     |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `payload` | `T \| Snapshot`          | ❌       | -       | -     | -          | Create body (Snapshot DTO or full T when shapes align)                                                                                          |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          | Per-call gateway options (e.g. `signal` from [ResourceGatewayOptions](../interfaces/ResourceCRUDInterface.md#resourcegatewayoptions-typealias)) |

---

##### `create` (CallSignature)

**Type:** `Promise<T>`

**Returns:**

Persisted resource from the gateway

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                                                                     |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `payload` | `T \| Snapshot`          | ❌       | -       | -     | -          | Create body (Snapshot DTO or full T when shapes align)                                                                                          |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          | Per-call gateway options (e.g. `signal` from [ResourceGatewayOptions](../interfaces/ResourceCRUDInterface.md#resourcegatewayoptions-typealias)) |

---

#### `detail` (Method)

**Type:** `(ref: RefType, options: ResourceGatewayOptions) => Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          |                                                |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          | Per-call gateway options (e.g. abort `signal`) |

---

##### `detail` (CallSignature)

**Type:** `Promise<T>`

Fetches one resource and updates the `'detail'` async store (`start` → `success` / `failed`).

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          |                                                |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          | Per-call gateway options (e.g. abort `signal`) |

---

##### `detail` (CallSignature)

**Type:** `Promise<T>`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `snapshot` | `Snapshot`               | ❌       | -       | -     | -          |             |
| `options`  | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `getGateway` (Method)

**Type:** `() => ResourceCRUDInterface<T, Snapshot> \| undefined`

---

##### `getGateway` (CallSignature)

**Type:** `ResourceCRUDInterface<T, Snapshot> \| undefined`

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

**Type:** `(name: CRUDResourceName) => ResourceCRUDStore<T>`

#### Parameters

| Name   | Type               | Optional | Default    | Since | Deprecated | Description                                               |
| ------ | ------------------ | -------- | ---------- | ----- | ---------- | --------------------------------------------------------- |
| `name` | `CRUDResourceName` | ✅       | `'create'` | -     | -          | Which operation’s store to return; defaults to `'create'` |

---

##### `getStore` (CallSignature)

**Type:** `ResourceCRUDStore<T>`

**Returns:**

The [ResourceCRUDStore](./ResourceCRUDStore.md#resourcecrudstore-class) backing that operation

#### Parameters

| Name   | Type               | Optional | Default    | Since | Deprecated | Description                                               |
| ------ | ------------------ | -------- | ---------- | ----- | ---------- | --------------------------------------------------------- |
| `name` | `CRUDResourceName` | ✅       | `'create'` | -     | -          | Which operation’s store to return; defaults to `'create'` |

---

#### `getStoreInterface` (Method)

**Type:** `(name: CRUDResourceName) => StoreInterface<AsyncStoreState<T>>`

#### Parameters

| Name   | Type               | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------ | -------- | ------- | ----- | ---------- | ----------- | -------- | -------- | --------- |
| `name` | `CRUDResourceName` | ❌       | -       | -     | -          | `'create'   | 'detail' | 'update' | 'remove'` |

---

##### `getStoreInterface` (CallSignature)

**Type:** `StoreInterface<AsyncStoreState<T>>`

Subscribe-friendly view of async state for the given operation (same underlying store as [getStore](#getstore-method)).

#### Parameters

| Name   | Type               | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------ | -------- | ------- | ----- | ---------- | ----------- | -------- | -------- | --------- |
| `name` | `CRUDResourceName` | ❌       | -       | -     | -          | `'create'   | 'detail' | 'update' | 'remove'` |

---

#### `remove` (Method)

**Type:** `(ref: RefType, options: ResourceGatewayOptions) => Promise<void>`

On success commits `null` into the `'remove'` store via `success(null)` (void operation).

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          |             |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          |             |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `snapshot` | `Snapshot`               | ❌       | -       | -     | -          |             |
| `options`  | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `refs`    | `parameter refs`         | ❌       | -       | -     | -          |             |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

#### Parameters

| Name        | Type                     | Optional | Default | Since | Deprecated | Description |
| ----------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `snapshots` | `parameter snapshots`    | ❌       | -       | -     | -          |             |
| `options`   | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

#### `update` (Method)

**Type:** `(ref: RefType, payload: Snapshot, options: ResourceGatewayOptions) => Promise<T>`

Forwards to the inner gateway’s overloads; updates the `'update'` store’s async state.

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          |             |
| `payload` | `Snapshot`               | ❌       | -       | -     | -          |             |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `update` (CallSignature)

**Type:** `Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          |             |
| `payload` | `Snapshot`               | ❌       | -       | -     | -          |             |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

##### `update` (CallSignature)

**Type:** `Promise<T>`

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `snapshot` | `Snapshot`               | ❌       | -       | -     | -          |             |
| `options`  | `ResourceGatewayOptions` | ✅       | -       | -     | -          |             |

---

### `CRUDResourceName` (TypeAlias)

**Type:** `"create" \| "detail" \| "update" \| "remove"`

---

### `ResourceCRUDIdentifiers` (TypeAlias)

**Type:** `type ResourceCRUDIdentifiers`

---

#### `INVALIDE_RESOURCE` (Property)

**Type:** `string`

---

### `ResourceCRUDOptions` (TypeAlias)

**Type:** `Omit<GatewayServiceOptions<T, ResourceCRUDInterface<T, S>>, "store"> & Object`

---
