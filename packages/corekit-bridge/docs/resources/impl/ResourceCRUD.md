## `src/core/resources/impl/ResourceCRUD` (Module)

**Type:** `module src/core/resources/impl/ResourceCRUD`

---

### `ResourceCRUD` (Class)

**Type:** `class ResourceCRUD<T, Snapshot>`

**Since:** `3.1.0`

Wraps a <a href="../interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface" class="tsd-kind-interface">ResourceCRUDInterface</a> implementation with async store state for UI binding.

Each operation (`create`, `detail`, `update`, `remove`) drives its own <a href="./ResourceCRUDStore.md#resourcecrudstore-class" class="tsd-kind-class">ResourceCRUDStore</a>: `start` before the
gateway call, `success` / `failed` after. Use <a href="#getstore-method" class="tsd-kind-method">getStore</a> or <a href="#getstoreinterface-method" class="tsd-kind-method">getStoreInterface</a> to subscribe from components.

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

#### `new ResourceCRUD` (Constructor)

**Type:** `(resource: ResourceCRUDInterface<T, Snapshot>, options: Partial<ResourceCRUDOptions<T, Snapshot>>) => ResourceCRUD<T, Snapshot>`

#### Parameters

| Name       | Type                                        | Optional | Default | Since | Deprecated | Description                                                                                                                                                                    |
| ---------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resource` | `ResourceCRUDInterface<T, Snapshot>`        | ❌       | -       | -     | -          | Bare <a href="../interfaces/ResourceCRUDInterface.md#resourcecrudinterface-interface" class="tsd-kind-interface">ResourceCRUDInterface</a> implementation (HTTP, RPC, mock, …) |
| `options`  | `Partial<ResourceCRUDOptions<T, Snapshot>>` | ✅       | -       | -     | -          | `serviceName`, logging, custom stores, <a href="#isresourceresult-property" class="tsd-kind-property">ResourceCRUDOptions.isResourceResult</a>, etc.                           |

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

**Type:** `ResourceCRUDStore<T, string>`

Store instance for state management

The async store that manages service state (loading, success, error).
Always initialized - created from provided instance or options, or defaults to new store.
Protected to allow subclasses to access while preventing external modification.

---

#### `storeMap` (Property)

**Type:** `Record<CRUDResourceName, ResourceCRUDStore<T, string>>`

---

#### `create` (Method)

**Type:** `(payload: T \| Snapshot, options: ResourceGatewayOptions) => Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                                                                                                            |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `payload` | `T \| Snapshot`          | ❌       | -       | -     | -          | Create body (Snapshot DTO or full T when shapes align)                                                                                                                                 |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          | Per-call gateway options (e.g. `signal` from <a href="../interfaces/ResourceCRUDInterface.md#resourcegatewayoptions-typealias" class="tsd-kind-type-alias">ResourceGatewayOptions</a>) |

---

##### `create` (CallSignature)

**Type:** `Promise<T>`

**Returns:**

Persisted resource from the gateway

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                                                                                                            |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `payload` | `T \| Snapshot`          | ❌       | -       | -     | -          | Create body (Snapshot DTO or full T when shapes align)                                                                                                                                 |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          | Per-call gateway options (e.g. `signal` from <a href="../interfaces/ResourceCRUDInterface.md#resourcegatewayoptions-typealias" class="tsd-kind-type-alias">ResourceGatewayOptions</a>) |

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

**Type:** `() => undefined \| ResourceCRUDInterface<T, Snapshot>`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| ResourceCRUDInterface<T, Snapshot>`

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

**Type:** `() => undefined \| LoggerInterface<unknown>`

---

##### `getLogger` (CallSignature)

**Type:** `undefined \| LoggerInterface<unknown>`

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

**Type:** `(name: CRUDResourceName) => ResourceCRUDStore<T, string>`

#### Parameters

| Name   | Type               | Optional | Default    | Since | Deprecated | Description                                               |
| ------ | ------------------ | -------- | ---------- | ----- | ---------- | --------------------------------------------------------- |
| `name` | `CRUDResourceName` | ✅       | `'create'` | -     | -          | Which operation’s store to return; defaults to `'create'` |

---

##### `getStore` (CallSignature)

**Type:** `ResourceCRUDStore<T, string>`

**Returns:**

The <a href="./ResourceCRUDStore.md#resourcecrudstore-class" class="tsd-kind-class">ResourceCRUDStore</a> backing that operation

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

Subscribe-friendly view of async state for the given operation (same underlying store as <a href="#getstore-method" class="tsd-kind-method">getStore</a>).

#### Parameters

| Name   | Type               | Optional | Default | Since | Deprecated | Description |
| ------ | ------------------ | -------- | ------- | ----- | ---------- | ----------- | -------- | -------- | --------- |
| `name` | `CRUDResourceName` | ❌       | -       | -     | -          | `'create'   | 'detail' | 'update' | 'remove'` |

---

#### `remove` (Method)

**Type:** `(ref: RefType, options: ResourceGatewayOptions) => Promise<void>`

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

**Type:** `Object`

---

#### `INVALIDE_RESOURCE` (Property)

**Type:** `string`

---

### `ResourceCRUDOptions` (TypeAlias)

**Type:** `Omit<GatewayServiceOptions<T, ResourceCRUDInterface<T, S>>, "store"> & Object`

---
