## `src/core/resources/impl/ResourceIO` (Module)

**Type:** `module src/core/resources/impl/ResourceIO`

---

### `ResourceIO` (Class)

**Type:** `class ResourceIO<TPayload, TCriteria>`

**Since:** `3.1.0`

Wraps a <a href="../interfaces/ResourceIOInterface.md#resourceiointerface-interface" class="tsd-kind-interface">ResourceIOInterface</a> implementation with async store state per operation (`importData`, `exportData`).

**Example:** Subscribe to import / export loading state

```typescript
const io = new ResourceIO(productGateway, { serviceName: 'products.io' });
io.getStoreInterface('importData').subscribe((s) => console.log(s.loading));
await io.importData(formData);
```

---

#### `new ResourceIO` (Constructor)

**Type:** `(resource: ResourceIOInterface<TPayload, TCriteria>, options: Partial<ResourceIOOptions<TPayload, TCriteria>>) => ResourceIO<TPayload, TCriteria>`

#### Parameters

| Name       | Type                                              | Optional | Default | Since | Deprecated | Description                                                                                                                                         |
| ---------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resource` | `ResourceIOInterface<TPayload, TCriteria>`        | ❌       | -       | -     | -          | Bare <a href="../interfaces/ResourceIOInterface.md#resourceiointerface-interface" class="tsd-kind-interface">ResourceIOInterface</a> implementation |
| `options`  | `Partial<ResourceIOOptions<TPayload, TCriteria>>` | ✅       | -       | -     | -          | `serviceName`, logger, custom stores, optional response guards, etc.                                                                                |

---

#### `gateway` (Property)

**Type:** `ResourceIOInterface<TPayload, TCriteria>`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).
Protected to allow subclasses to access while preventing external modification.

---

#### `identifiers` (Property)

**Type:** `ResourceIOIdentifiers`

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

**Type:** `ResourceCRUDStore<ResourceInResult, string>`

Store instance for state management

The async store that manages service state (loading, success, error).
Always initialized - created from provided instance or options, or defaults to new store.
Protected to allow subclasses to access while preventing external modification.

---

#### `storeMap` (Property)

**Type:** `Object`

---

##### `exportData` (Property)

**Type:** `ResourceCRUDStore<ResourceOutResult, string>`

---

##### `importData` (Property)

**Type:** `ResourceCRUDStore<ResourceInResult, string>`

---

#### `exportData` (Method)

**Type:** `(scope: TCriteria) => Promise<ResourceOutResult>`

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `scope` | `TCriteria` | ❌       | -       | -     | -          |             |

---

##### `exportData` (CallSignature)

**Type:** `Promise<ResourceOutResult>`

Runs <a href="../interfaces/ResourceIOInterface.md#exportdata-method" class="tsd-kind-method">ResourceIOInterface.exportData</a> and updates the `exportData` store (`start` → `success` / `failed`).

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `scope` | `TCriteria` | ❌       | -       | -     | -          |             |

---

#### `getGateway` (Method)

**Type:** `() => undefined \| ResourceIOInterface<TPayload, TCriteria>`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| ResourceIOInterface<TPayload, TCriteria>`

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

**Type:** `(name: IOResourceName) => ResourceCRUDStore<ResourceInResult, string> \| ResourceCRUDStore<ResourceOutResult, string>`

#### Parameters

| Name   | Type             | Optional | Default        | Since | Deprecated | Description                                                                                                                                                                                                     |
| ------ | ---------------- | -------- | -------------- | ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | `IOResourceName` | ✅       | `'importData'` | -     | -          | Which operation’s store to return; defaults to `'importData'` (matches the primary <a href="../../gateway-service/impl/GatewayService.md#gatewayservice-class" class="tsd-kind-class">GatewayService</a> store) |

---

##### `getStore` (CallSignature)

**Type:** `ResourceCRUDStore<ResourceInResult, string> \| ResourceCRUDStore<ResourceOutResult, string>`

#### Parameters

| Name   | Type             | Optional | Default        | Since | Deprecated | Description                                                                                                                                                                                                     |
| ------ | ---------------- | -------- | -------------- | ----- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | `IOResourceName` | ✅       | `'importData'` | -     | -          | Which operation’s store to return; defaults to `'importData'` (matches the primary <a href="../../gateway-service/impl/GatewayService.md#gatewayservice-class" class="tsd-kind-class">GatewayService</a> store) |

---

#### `getStoreInterface` (Method)

**Type:** `(name: IOResourceName) => StoreInterface<AsyncStoreState<ResourceInResult>> \| StoreInterface<AsyncStoreState<ResourceOutResult>>`

#### Parameters

| Name   | Type             | Optional | Default        | Since | Deprecated | Description    |
| ------ | ---------------- | -------- | -------------- | ----- | ---------- | -------------- | ------------------------------------------ |
| `name` | `IOResourceName` | ✅       | `'importData'` | -     | -          | `'importData'` | `'exportData'`; defaults to `'importData'` |

---

##### `getStoreInterface` (CallSignature)

**Type:** `StoreInterface<AsyncStoreState<ResourceInResult>> \| StoreInterface<AsyncStoreState<ResourceOutResult>>`

Subscribe-friendly view of async state for the given operation.

#### Parameters

| Name   | Type             | Optional | Default        | Since | Deprecated | Description    |
| ------ | ---------------- | -------- | -------------- | ----- | ---------- | -------------- | ------------------------------------------ |
| `name` | `IOResourceName` | ✅       | `'importData'` | -     | -          | `'importData'` | `'exportData'`; defaults to `'importData'` |

---

#### `importData` (Method)

**Type:** `(source: TPayload) => Promise<ResourceInResult>`

#### Parameters

| Name     | Type       | Optional | Default | Since | Deprecated | Description |
| -------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `source` | `TPayload` | ❌       | -       | -     | -          |             |

---

##### `importData` (CallSignature)

**Type:** `Promise<ResourceInResult>`

Runs <a href="../interfaces/ResourceIOInterface.md#importdata-method" class="tsd-kind-method">ResourceIOInterface.importData</a> and updates the `importData` store (`start` → `success` / `failed`).

#### Parameters

| Name     | Type       | Optional | Default | Since | Deprecated | Description |
| -------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `source` | `TPayload` | ❌       | -       | -     | -          |             |

---

### `IOResourceName` (TypeAlias)

**Type:** `"importData" \| "exportData"`

Operation key for <a href="#resourceio-class" class="tsd-kind-class">ResourceIO</a> store selection (`importData` | `exportData`).

---

### `ResourceIOIdentifiers` (TypeAlias)

**Type:** `Object`

---

#### `INVALID_EXPORT_RESULT` (Property)

**Type:** `string`

---

#### `INVALID_IMPORT_RESULT` (Property)

**Type:** `string`

---

### `ResourceIOOptions` (TypeAlias)

**Type:** `Omit<GatewayServiceOptions<ResourceInResult, ResourceIOInterface<TPayload, TCriteria>>, "store"> & Object`

---
