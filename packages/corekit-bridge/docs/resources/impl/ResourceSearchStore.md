## `src/core/resources/impl/ResourceSearchStore` (Module)

**Type:** `module src/core/resources/impl/ResourceSearchStore`

---

### `ResourceSearchStore` (Class)

**Type:** `class ResourceSearchStore<TItem, Criteria, Key>`

Async store for list/search UIs: holds <a href="#resourcesearchstorestate-class" class="tsd-kind-class">ResourceSearchStoreState</a> (last <a href="../interfaces/ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a>, `criteria`,
and optional staging fields). Used by ResourceSearch and ResourceScroll; construction usually goes
through createResourceSearchStore so `defaultState` is wired correctly.

**Example:** Local criteria and staging without calling the gateway

```typescript
const store = new ResourceSearchStore<Row, RowCriteria>('products.list');
store.patchCriteria({ page: 2 });
store.setKeyword('acme');
store.addStageRef('row-7');
store.addStageItem(previewRow);
```

---

#### `new ResourceSearchStore` (Constructor)

**Type:** `(resourceName: GatewayServiceName, options: AsyncStoreOptions<ResourceSearchStoreState<TItem, Criteria>, Key, unknown>) => ResourceSearchStore<TItem, Criteria, Key>`

#### Parameters

| Name           | Type                                                                         | Optional | Default | Since | Deprecated | Description |
| -------------- | ---------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `resourceName` | `GatewayServiceName`                                                         | ❌       | -       | -     | -          |             |
| `options`      | `AsyncStoreOptions<ResourceSearchStoreState<TItem, Criteria>, Key, unknown>` | ✅       | -       | -     | -          |             |

---

#### `getStorage` (Property)

**Type:** `Object`

When storageResult=true, should return S['result']
When storageResult=false, should return S

---

#### `resourceName` (Property)

**Type:** `GatewayServiceName`

---

#### `storage` (Property)

**Type:** `null \| StorageInterface<Key, ResourceSearchStoreState<TItem, Criteria>, unknown>`

**Default:** `null`

Storage implementation for persisting state, or `null` if persistence is not needed
When `null`, `restore()` / `persist()` typically no-op (depending on subclass)

---

#### `storageKey` (Property)

**Type:** `null \| Key`

**Default:** `null`

Storage key for persisting state

The key used to store state in the storage backend.
Set during construction from `AsyncStoreOptions.storageKey`.

---

#### `storageResult` (Property)

**Type:** `boolean`

**Default:** `true`

Control the type of data stored in persistence

This property controls what data is stored and restored from storage:

- `true`: Store only the result value (`T`). `restore()` returns `T | null`
- `false`: Store the full state object. `restore()` returns `AsyncStoreStateInterface<T> | null`

**Note:** This is primarily an internal testing property. In most cases, storing
only the result value (`true`) is sufficient and more efficient.

---

#### `store` (Property)

**Type:** `StoreInterface<ResourceSearchStoreState<TItem, Criteria>>`

---

#### `addStageItem` (Method)

**Type:** `(item: TItem) => void`

#### Parameters

| Name   | Type    | Optional | Default | Since | Deprecated | Description |
| ------ | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `item` | `TItem` | ❌       | -       | -     | -          |             |

---

##### `addStageItem` (CallSignature)

**Type:** `void`

Append one item to `stageItems`.

#### Parameters

| Name   | Type    | Optional | Default | Since | Deprecated | Description |
| ------ | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `item` | `TItem` | ❌       | -       | -     | -          |             |

---

#### `addStageRef` (Method)

**Type:** `(ref: RefType) => void`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ref` | `RefType` | ❌       | -       | -     | -          |             |

---

##### `addStageRef` (CallSignature)

**Type:** `void`

Append a reference if it is not already present (`===` against current `stageRefs`).

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ref` | `RefType` | ❌       | -       | -     | -          |             |

---

#### `clearStageItems` (Method)

**Type:** `() => void`

---

##### `clearStageItems` (CallSignature)

**Type:** `void`

Clear staged items (`stageItems` → `[]`).

---

#### `clearStageRefs` (Method)

**Type:** `() => void`

---

##### `clearStageRefs` (CallSignature)

**Type:** `void`

Clear all staged references (`stageRefs` → `[]`).

---

#### `emit` (Method)

**Type:** `(state: ResourceSearchStoreState<TItem, Criteria> \| Partial<ResourceSearchStoreState<TItem, Criteria>>, options: Object) => void`

#### Parameters

| Name              | Type                                                                                              | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `state`           | `ResourceSearchStoreState<TItem, Criteria> \| Partial<ResourceSearchStoreState<TItem, Criteria>>` | ❌       | -       | -     | -          |             |
| `options`         | `Object`                                                                                          | ✅       | -       | -     | -          |             |
| `options.persist` | `boolean`                                                                                         | ✅       | -       | -     | -          |             |

---

##### `emit` (CallSignature)

**Type:** `void`

#### Parameters

| Name              | Type                                                                                              | Optional | Default | Since | Deprecated | Description |
| ----------------- | ------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `state`           | `ResourceSearchStoreState<TItem, Criteria> \| Partial<ResourceSearchStoreState<TItem, Criteria>>` | ❌       | -       | -     | -          |             |
| `options`         | `Object`                                                                                          | ✅       | -       | -     | -          |             |
| `options.persist` | `boolean`                                                                                         | ✅       | -       | -     | -          |             |

---

#### `failed` (Method)

**Type:** `(error: unknown, result: null \| ResourceSearchResult<TItem>) => void`

#### Parameters

| Name                                                             | Type                                  | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`                             | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `null \| ResourceSearchResult<TItem>` | ✅       | -       | -     | -          | Optional result value if partial results are available |

If provided (including `null`), will update the result to this value
If not provided (`undefined`), will preserve the existing result
Useful when operation fails but has partial data to preserve, or when you want to clear result |

---

##### `failed` (CallSignature)

**Type:** `void`

Mark an async operation as failed

Marks the end of an async operation with a failure. This should be called
when an operation encounters an error or exception.

Behavior:

- Sets `loading` to `false`
- Sets `status` to `FAILED`
- Records `endTime` with current timestamp
- Sets `error` with the failure information
- Preserves existing `result` if not provided, or sets `result` if explicitly provided
- Automatically persists state to storage (if configured)

**Example:** Handle API error (preserves existing result)

```typescript
try {
  const user = await fetchUser();
  store.success(user);
} catch (error) {
  store.failed(error);
  // Existing user data is preserved
}
```

**Example:** Handle failure with partial data

```typescript
try {
  const data = await fetchData();
  store.success(data);
} catch (error) {
  // Operation failed but we have cached data
  store.failed(error, cachedData);
}
```

**Example:** Clear result on failure

```typescript
try {
  const data = await fetchData();
  store.success(data);
} catch (error) {
  // Explicitly clear result on failure
  store.failed(error, null);
}
```

#### Parameters

| Name                                                             | Type                                  | Optional | Default | Since | Deprecated | Description                                            |
| ---------------------------------------------------------------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`                                                          | `unknown`                             | ❌       | -       | -     | -          | The error that occurred during the operation           |
| Can be an Error object, string message, or any error information |
| `result`                                                         | `null \| ResourceSearchResult<TItem>` | ✅       | -       | -     | -          | Optional result value if partial results are available |

If provided (including `null`), will update the result to this value
If not provided (`undefined`), will preserve the existing result
Useful when operation fails but has partial data to preserve, or when you want to clear result |

---

#### `getDuration` (Method)

**Type:** `() => number`

---

##### `getDuration` (CallSignature)

**Type:** `number`

Get the duration of the async operation

Calculates the duration based on the current state's `startTime` and `endTime`:

- Returns `0` if operation has not started (`startTime` is `0` or not set)
- If operation is in progress (`endTime` is `0` or not set), returns `Date.now() - startTime`
- If operation has completed, returns `endTime - startTime`
- Handles type conversion: supports `number`, `string` (parsed via `parseFloat`), or other types (converted via `Number`)
- Returns `0` if startTime or endTime cannot be converted to valid numbers
- Returns `0` if startTime is greater than endTime (invalid state)
- Prevents overflow by checking against `Number.MAX_SAFE_INTEGER`

**Returns:**

The duration of the async operation in milliseconds, or `0` if duration cannot be calculated

**Example:** Get duration for completed operation

```typescript
store.start();
// ... operation completes ...
store.success(result);
const duration = store.getDuration();
console.log(`Operation took ${duration}ms`);
```

**Example:** Get duration for in-progress operation

```typescript
store.start();
// ... operation still running ...
const duration = store.getDuration(); // Returns time since start
console.log(`Operation has been running for ${duration}ms`);
```

---

#### `getError` (Method)

**Type:** `() => unknown`

---

##### `getError` (CallSignature)

**Type:** `unknown`

Get the error from the async operation

Returns the error information if the operation failed, or `null` if no error.
Equivalent to `getState().error`.

**Returns:**

The error information if operation failed, or `null` if no error

**Example:** Handle error

```typescript
const error = store.getError();
if (error) {
  console.error('Operation failed:', error);
}
```

---

#### `getLoading` (Method)

**Type:** `() => boolean`

---

##### `getLoading` (CallSignature)

**Type:** `boolean`

Get the loading state of the async operation

Convenience method to check if an operation is currently in progress.
Equivalent to `getState().loading`.

**Returns:**

`true` if the operation is in progress, `false` otherwise

**Example:** Check loading state

```typescript
if (store.getLoading()) {
  console.log('Operation in progress...');
}
```

---

#### `getResult` (Method)

**Type:** `() => null \| ResourceSearchResult<TItem>`

---

##### `getResult` (CallSignature)

**Type:** `null \| ResourceSearchResult<TItem>`

Get the result from the async operation

Returns the result data if the operation succeeded, or `null` if no result.
Equivalent to `getState().result`.

**Returns:**

The result data if operation succeeded, or `null` if no result

**Example:** Access result

```typescript
const result = store.getResult();
if (result) {
  console.log('Operation result:', result);
}
```

---

#### `getState` (Method)

**Type:** `() => ResourceSearchStoreState<TItem, Criteria>`

---

##### `getState` (CallSignature)

**Type:** `ResourceSearchStoreState<TItem, Criteria>`

Get current store state

Returns the current state object containing all async operation information.
This is a snapshot of the current state at the time of call.

**Returns:**

Current state object containing:

- `loading`: Whether operation is in progress
- `result`: Operation result (if successful)
- `error`: Error information (if failed)
- `startTime`: Operation start timestamp
- `endTime`: Operation end timestamp
- `status`: Operation status

**Example:** Get current state

```typescript
const state = store.getState();
console.log('Loading:', state.loading);
console.log('Result:', state.result);
```

**Example:** Use state for conditional logic

```typescript
const state = store.getState();
if (state.loading) {
  return <LoadingSpinner />;
} else if (state.result) {
  return <DataDisplay data={state.result} />;
}
```

---

#### `getStatus` (Method)

**Type:** `() => AsyncStoreStatusType`

---

##### `getStatus` (CallSignature)

**Type:** `AsyncStoreStatusType`

Get the status of the async operation

Returns the status information about the operation state.
The status type depends on the implementation (e.g., `'pending' | 'success' | 'failed' | 'stopped'`).
Equivalent to `getState().status`.

**Returns:**

The status of the async operation

**Example:** Check status

```typescript
const status = store.getStatus();
switch (status) {
  case AsyncStoreStatus.PENDING:
    return <LoadingSpinner />;
  case AsyncStoreStatus.SUCCESS:
    return <SuccessMessage />;
  case AsyncStoreStatus.FAILED:
    return <ErrorMessage />;
}
```

---

#### `getStore` (Method)

**Type:** `() => StoreInterface<ResourceSearchStoreState<TItem, Criteria>>`

---

##### `getStore` (CallSignature)

**Type:** `StoreInterface<ResourceSearchStoreState<TItem, Criteria>>`

Get the underlying store instance

Returns the composed <a href="../interface/StoreInterface.md#storeinterface-interface" class="tsd-kind-interface">StoreInterface</a> (typically SliceStoreAdapter), enabling
reactive subscriptions via <a href="../interface/StoreInterface.md#subscribe-property" class="tsd-kind-property">StoreInterface.subscribe</a>.

**Returns:**

The store instance for reactive subscriptions

**Example:** Subscribe to state changes

```typescript
const port = asyncStore.getStore();
port.subscribe((state) => {
  console.log('State changed:', state);
});
```

---

#### `isCompleted` (Method)

**Type:** `() => boolean`

---

##### `isCompleted` (CallSignature)

**Type:** `boolean`

Check if the async operation is completed

Returns `true` if the operation has finished, regardless of outcome.
This includes success, failure, and stopped states. Returns `false` if still in progress.

**Returns:**

`true` if the async operation is completed (success, failed, or stopped), `false` otherwise

**Example:** Check if operation finished

```typescript
if (store.isCompleted()) {
  // Operation is done, can proceed with next steps
  proceedToNextStep();
}
```

---

#### `isFailed` (Method)

**Type:** `() => boolean`

---

##### `isFailed` (CallSignature)

**Type:** `boolean`

Check if the async operation failed

Returns `true` if the operation has failed with an error.
This typically means `loading` is `false` and `error` is not `null`.

**Returns:**

`true` if the async operation is failed, `false` otherwise

**Example:** Handle failure

```typescript
if (store.isFailed()) {
  const error = store.getError();
  console.error('Operation failed:', error);
}
```

---

#### `isPending` (Method)

**Type:** `() => boolean`

---

##### `isPending` (CallSignature)

**Type:** `boolean`

Check if the async operation is pending (in progress)

Returns `true` if the operation is currently in progress.
This is equivalent to checking if `loading` is `true`.

**Returns:**

`true` if the async operation is pending (in progress), `false` otherwise

**Example:** Show loading indicator

```typescript
if (store.isPending()) {
  return <LoadingSpinner />;
}
```

---

#### `isStopped` (Method)

**Type:** `() => boolean`

---

##### `isStopped` (CallSignature)

**Type:** `boolean`

Check if the async operation was stopped

Returns `true` if the operation was manually stopped (e.g., user cancellation).
This is different from failure - stopping is intentional, failure is an error.

**Returns:**

`true` if the async operation is stopped, `false` otherwise

**Example:** Handle stopped operation

```typescript
if (store.isStopped()) {
  console.log('Operation was cancelled');
}
```

---

#### `isSuccess` (Method)

**Type:** `() => boolean`

---

##### `isSuccess` (CallSignature)

**Type:** `boolean`

Check if the async operation completed successfully

Returns `true` if the operation has completed successfully with a result.
This typically means `loading` is `false`, `error` is `null`, and `result` is not `null`.

**Returns:**

`true` if the async operation is successful, `false` otherwise

**Example:** Check success before accessing result

```typescript
if (store.isSuccess()) {
  const result = store.getResult();
  console.log('Success:', result);
}
```

---

#### `patchCriteria` (Method)

**Type:** `(partial: Partial<Criteria>) => void`

#### Parameters

| Name      | Type                | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `partial` | `Partial<Criteria>` | ❌       | -       | -     | -          |             |

---

##### `patchCriteria` (CallSignature)

**Type:** `void`

Shallow-merge partial criteria into the current snapshot (does not call the API).

#### Parameters

| Name      | Type                | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `partial` | `Partial<Criteria>` | ❌       | -       | -     | -          |             |

---

#### `persist` (Method)

**Type:** `(_state: T) => void`

#### Parameters

| Name                                                                      | Type | Optional | Default | Since | Deprecated | Description                                                          |
| ------------------------------------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state`                                                                  | `T`  | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |
| This parameter is not used. The method always persists the current state. |

---

##### `persist` (CallSignature)

**Type:** `void`

Persist state to storage

Persists the current state to the configured storage backend.
The data persisted depends on the `storageResult` property:

- If `storageResult` is `true`: Stores only the result value (`T`)
- If `storageResult` is `false`: Stores the full state object

Behavior:

- Does nothing if storage or storageKey is not configured
- If `storageResult` is `true` and result is `null`, nothing is stored
- If `storageResult` is `false`, always stores the full state object (even if result is null)
- Automatically called by `emit()` when state changes (unless `persist: false` is specified)
- Always persists the current state (the `_state` parameter is ignored for compatibility with interface)

**Example:** Automatic persistence (via emit)

```typescript
store.success(user); // Automatically persists to storage
```

**Example:** Manual persistence

```typescript
store.persist(); // Persist current state
```

**Example:** Persist only result value (default)

```typescript
store.storageResult = true; // default
store.success(user);
// Storage contains only the user object
```

**Example:** Persist full state

```typescript
store.storageResult = false;
store.success(user);
// Storage contains full state object with loading, status, timestamps, etc.
```

#### Parameters

| Name                                                                      | Type | Optional | Default | Since | Deprecated | Description                                                          |
| ------------------------------------------------------------------------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------- |
| `_state`                                                                  | `T`  | ✅       | -       | -     | -          | Optional state parameter (ignored, kept for interface compatibility) |
| This parameter is not used. The method always persists the current state. |

---

#### `removeStageItem` (Method)

**Type:** `(predicate: Object) => void`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `predicate` | `Object` | ❌       | -       | -     | -          |             |

---

##### `removeStageItem` (CallSignature)

**Type:** `void`

Remove the first item matching `predicate`.

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `predicate` | `Object` | ❌       | -       | -     | -          |             |

---

#### `removeStageItemAt` (Method)

**Type:** `(index: number) => void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `index` | `number` | ❌       | -       | -     | -          |             |

---

##### `removeStageItemAt` (CallSignature)

**Type:** `void`

Remove the item at `index` if in range.

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `index` | `number` | ❌       | -       | -     | -          |             |

---

#### `removeStageRef` (Method)

**Type:** `(ref: RefType) => void`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ref` | `RefType` | ❌       | -       | -     | -          |             |

---

##### `removeStageRef` (CallSignature)

**Type:** `void`

Remove every staged reference strictly equal to `ref`.

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ref` | `RefType` | ❌       | -       | -     | -          |             |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset store state to initial state

Clears all state data and resets to default values. This is useful when
starting a new operation or clearing previous operation state.

Behavior:

- Resets `loading` to `false`
- Clears `result` (sets to `null`)
- Clears `error` (sets to `null`)
- Resets `startTime` and `endTime` to `0`
- Resets `status` to `DRAFT`

**Example:** Reset before new operation

```typescript
store.reset();
store.start();
// Now ready for a new operation
```

**Example:** Reset after error recovery

```typescript
store.failed(error);
// ... handle error ...
store.reset();
// Ready to retry
```

---

#### `restore` (Method)

**Type:** `() => null \| R`

---

##### `restore` (CallSignature)

**Type:** `null \| R`

Restore state from storage

Restores state from the configured storage backend. The return type depends
on the `storageResult` property:

- If `storageResult` is `true`: Returns only the result value (`T`)
- If `storageResult` is `false`: Returns the full state object

Behavior:

- Checks if storage and storageKey are configured
- Retrieves data from storage based on `storageResult` mode
- Updates store state without triggering persistence (prevents circular updates)
- Returns `null` if storage is not configured, no data found, or restoration fails

**Returns:**

The restored value or state, or `null` if not available

**Example:** Restore result value (storageResult = true)

```typescript
const result = store.restore(); // Returns T | null
if (result) {
  console.log('Restored user:', result);
}
```

**Example:** Restore full state (storageResult = false)

```typescript
store.storageResult = false;
const state = store.restore(); // Returns AsyncStoreStateInterface<T> | null
if (state) {
  console.log('Restored state:', state);
}
```

---

#### `setCriteria` (Method)

**Type:** `(criteria: null \| Criteria) => void`

#### Parameters

| Name       | Type               | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria` | `null \| Criteria` | ❌       | -       | -     | -          |             |

---

##### `setCriteria` (CallSignature)

**Type:** `void`

Replace stored criteria (does not call the API).

#### Parameters

| Name       | Type               | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `criteria` | `null \| Criteria` | ❌       | -       | -     | -          |             |

---

#### `setKeyword` (Method)

**Type:** `(keyword: undefined \| string) => void`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                                                                                                                          |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyword` | `undefined \| string` | ❌       | -       | -     | -          | Free-text query (see <a href="../interfaces/ResourceSearchInterface.md#keyword-property" class="tsd-kind-property">ResourceSearchParams.keyword</a>) |

---

##### `setKeyword` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type                  | Optional | Default | Since | Deprecated | Description                                                                                                                                          |
| --------- | --------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keyword` | `undefined \| string` | ❌       | -       | -     | -          | Free-text query (see <a href="../interfaces/ResourceSearchInterface.md#keyword-property" class="tsd-kind-property">ResourceSearchParams.keyword</a>) |

---

#### `setPage` (Method)

**Type:** `(page: number) => void`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                                                                                                                                                             |
| ------ | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page` | `number` | ❌       | -       | -     | -          | Request page (semantics are API-specific; see <a href="../interfaces/ResourceSearchInterface.md#page-property" class="tsd-kind-property">ResourceSearchParams.page</a>) |

---

##### `setPage` (CallSignature)

**Type:** `void`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                                                                                                                                                             |
| ------ | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page` | `number` | ❌       | -       | -     | -          | Request page (semantics are API-specific; see <a href="../interfaces/ResourceSearchInterface.md#page-property" class="tsd-kind-property">ResourceSearchParams.page</a>) |

---

#### `setPageSize` (Method)

**Type:** `(pageSize: number) => void`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                                                                                                                                        |
| ---------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pageSize` | `number` | ❌       | -       | -     | -          | Window size (see <a href="../interfaces/ResourceSearchInterface.md#pagesize-property" class="tsd-kind-property">ResourceSearchParams.pageSize</a>) |

---

##### `setPageSize` (CallSignature)

**Type:** `void`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                                                                                                                                        |
| ---------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pageSize` | `number` | ❌       | -       | -     | -          | Window size (see <a href="../interfaces/ResourceSearchInterface.md#pagesize-property" class="tsd-kind-property">ResourceSearchParams.pageSize</a>) |

---

#### `setStageItems` (Method)

**Type:** `(items: parameter items) => void`

#### Parameters

| Name    | Type              | Optional | Default | Since | Deprecated | Description |
| ------- | ----------------- | -------- | ------- | ----- | ---------- | ----------- |
| `items` | `parameter items` | ❌       | -       | -     | -          |             |

---

##### `setStageItems` (CallSignature)

**Type:** `void`

Replace the staged item list (does not call the API).

#### Parameters

| Name    | Type              | Optional | Default | Since | Deprecated | Description |
| ------- | ----------------- | -------- | ------- | ----- | ---------- | ----------- |
| `items` | `parameter items` | ❌       | -       | -     | -          |             |

---

#### `setStageRefs` (Method)

**Type:** `(refs: parameter refs) => void`

#### Parameters

| Name   | Type             | Optional | Default | Since | Deprecated | Description |
| ------ | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `refs` | `parameter refs` | ❌       | -       | -     | -          |             |

---

##### `setStageRefs` (CallSignature)

**Type:** `void`

Replace the staged reference list (does not call the API).

#### Parameters

| Name   | Type             | Optional | Default | Since | Deprecated | Description |
| ------ | ---------------- | -------- | ------- | ----- | ---------- | ----------- |
| `refs` | `parameter refs` | ❌       | -       | -     | -          |             |

---

#### `start` (Method)

**Type:** `(result: null \| ResourceSearchResult<TItem>) => void`

#### Parameters

| Name                                                                | Type                                  | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `null \| ResourceSearchResult<TItem>` | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

##### `start` (CallSignature)

**Type:** `void`

Start an async operation

Marks the beginning of an async operation and sets the loading state to `true`.
Records the start timestamp and optionally sets an initial result value.

Behavior:

- Sets `loading` to `true`
- Sets `status` to `PENDING`
- Records `startTime` with current timestamp
- Optionally sets `result` if provided
- Automatically persists state to storage (if configured)

**Example:** Start operation

```typescript
store.start();
// Operation is now in progress, loading = true
```

**Example:** Start with optimistic result

```typescript
store.start(cachedUser);
// Start with cached data while fetching fresh data
```

#### Parameters

| Name                                                                | Type                                  | Optional | Default | Since | Deprecated | Description                                                  |
| ------------------------------------------------------------------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `result`                                                            | `null \| ResourceSearchResult<TItem>` | ✅       | -       | -     | -          | Optional initial result value to set before operation starts |
| Useful for optimistic updates or when resuming a previous operation |

---

#### `stopped` (Method)

**Type:** `(error: unknown, result: null \| ResourceSearchResult<TItem>) => void`

#### Parameters

| Name     | Type                                  | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`                             | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `null \| ResourceSearchResult<TItem>` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

---

##### `stopped` (CallSignature)

**Type:** `void`

Stop an async operation

Manually stops an async operation (e.g., user cancellation). This is different
from failure - stopping is intentional, while failure indicates an error occurred.

Behavior:

- Sets `loading` to `false`
- Sets `status` to `STOPPED`
- Records `endTime` with current timestamp
- Optionally sets `error` and `result` if provided
- Automatically persists state to storage (if configured)

**Example:** Stop operation

```typescript
store.start();
// ... user cancels operation ...
store.stopped();
```

**Example:** Stop with error

```typescript
store.stopped(new Error('User cancelled'));
```

#### Parameters

| Name     | Type                                  | Optional | Default | Since | Deprecated | Description                                                         |
| -------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------- |
| `error`  | `unknown`                             | ✅       | -       | -     | -          | Optional error information if operation was stopped due to an error |
| `result` | `null \| ResourceSearchResult<TItem>` | ✅       | -       | -     | -          | Optional result value if partial results are available              |

---

#### `success` (Method)

**Type:** `(result: null \| ResourceSearchResult<TItem>) => void`

#### Parameters

| Name                                                   | Type                                  | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | ------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `null \| ResourceSearchResult<TItem>` | ❌       | -       | -     | -          | The result of the successful async operation |
| This is the data returned from the completed operation |

---

##### `success` (CallSignature)

**Type:** `void`

Mark an async operation as successful

Marks the end of an async operation with a successful result. This should be
called when an operation completes successfully.

Behavior:

- Sets `loading` to `false`
- Sets `status` to `SUCCESS`
- Records `endTime` with current timestamp
- Sets `result` with the successful result data
- Clears `error` (sets to `null`)
- Automatically persists state to storage (if configured)

**Example:** Handle successful API response

```typescript
try {
  const user = await fetchUser();
  store.success(user);
} catch (error) {
  store.failed(error);
}
```

**Example:** Handle successful data transformation

```typescript
const processedData = processData(rawData);
store.success(processedData);
```

#### Parameters

| Name                                                   | Type                                  | Optional | Default | Since | Deprecated | Description                                  |
| ------------------------------------------------------ | ------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `result`                                               | `null \| ResourceSearchResult<TItem>` | ❌       | -       | -     | -          | The result of the successful async operation |
| This is the data returned from the completed operation |

---

#### `updateStageItemAt` (Method)

**Type:** `(index: number, patch: StoreUpdateValue<TItem>) => void`

#### Parameters

| Name    | Type                      | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `index` | `number`                  | ❌       | -       | -     | -          |             |
| `patch` | `StoreUpdateValue<TItem>` | ❌       | -       | -     | -          |             |

---

##### `updateStageItemAt` (CallSignature)

**Type:** `void`

Shallow-merge `patch` into the staged item at `index` (no-op if out of range). Intended for object-like
TItem rows; uses <a href="../../store-state/clone.md#clone-function" class="tsd-kind-function">clone</a> like ResourceCRUDStore.updateActiveDetail.

#### Parameters

| Name    | Type                      | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `index` | `number`                  | ❌       | -       | -     | -          |             |
| `patch` | `StoreUpdateValue<TItem>` | ❌       | -       | -     | -          |             |

---

### `ResourceSearchStoreState` (Class)

**Type:** `class ResourceSearchStoreState<TItem, Criteria>`

Async state for list/search/scroll UI: last <a href="../interfaces/ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> in `result` plus current `criteria`.
Used by <a href="#resourcesearchstore-class" class="tsd-kind-class">ResourceSearchStore</a> (including ResourceScroll).

**Example:** Seed defaults when constructing via {@link createResourceSearchStore}

```typescript
new ResourceSearchStoreState({
  criteria: { page: 1, pageSize: 25 },
  stageRefs: [],
  stageItems: []
});
```

---

#### `new ResourceSearchStoreState` (Constructor)

**Type:** `(options: Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>) => ResourceSearchStoreState<TItem, Criteria>`

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Partial<ResourceSearchStoreStateOptions<TItem, Criteria>>` | ✅       | -       | -     | -          |             |

---

#### `criteria` (Property)

**Type:** `null \| Criteria`

Last submitted search criteria; used for refresh / loadNext when no new criteria are passed.

**Remarks:**

Do **not** use a class field initializer (`= null`) here: in TS/ES, subclass field initializers run
after <a href="../../store-state/impl/AsyncStoreState.md#asyncstorestate-class" class="tsd-kind-class">AsyncStoreState</a>'s constructor `Object.assign(this, options)` and would wipe
`options.criteria` from createResourceSearchStore / default state.

---

#### `endTime` (Property)

**Type:** `number`

**Default:** `0`

Timestamp when the async operation completed

Used with `startTime` to calculate total operation duration.
Will be `0` if operation hasn't completed.

---

#### `error` (Property)

**Type:** `unknown`

**Default:** `null`

Error information if the async operation failed

Will be `null` if:

- Operation hasn't completed
- Operation completed successfully

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `false`

Whether the async operation is currently in progress

---

#### `result` (Property)

**Type:** `null \| ResourceSearchResult<TItem>`

**Default:** `null`

The result of the async operation if successful

Will be `null` if:

- Operation hasn't completed
- Operation failed
- Operation completed but returned no data

---

#### `stageItems` (Property)

**Type:** `TItem[]`

See <a href="#stageitems-property" class="tsd-kind-property">ResourceSearchStoreStateOptions.stageItems</a>.

---

#### `stageRefs` (Property)

**Type:** `RefType[]`

See <a href="#stagerefs-property" class="tsd-kind-property">ResourceSearchStoreStateOptions.stageRefs</a>.

---

#### `startTime` (Property)

**Type:** `number`

**Default:** `0`

Timestamp when the async operation started

Used for performance tracking and duration calculations.
Will be `0` if operation hasn't started.

---

#### `status` (Property)

**Type:** `AsyncStoreStatusType`

**Default:** `AsyncStoreStatus.DRAFT`

Current status of the async operation

Status values:

- `DRAFT`: Initial state, operation hasn't started
- `PENDING`: Operation is in progress
- `SUCCESS`: Operation completed successfully
- `FAILED`: Operation failed with an error
- `STOPPED`: Operation was manually stopped

---

### `ResourceSearchStoreStateOptions` (Interface)

**Type:** `interface ResourceSearchStoreStateOptions<TItem, Criteria>`

Async store state interface

Extends `AsyncStateInterface` with status tracking for async operations.
This interface provides a complete state structure for managing async operations
with status information.

---

#### `criteria` (Property)

**Type:** `null \| Criteria`

Last submitted search criteria; used for refresh / loadNext when no new criteria are passed.

---

#### `endTime` (Property)

**Type:** `number`

Timestamp when the async operation completed

Will be 0 if operation hasn't completed
Used with startTime to calculate total operation duration

**Example:**

```ts
`Date.now()`;
```

---

#### `error` (Property)

**Type:** `unknown`

Error information if the async operation failed

Will be null if:

- Operation hasn't completed
- Operation completed successfully

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether the async operation is currently in progress

---

#### `result` (Property)

**Type:** `null \| ResourceSearchResult<TItem>`

The result of the async operation if successful

Will be null if:

- Operation hasn't completed
- Operation failed
- Operation completed but returned no data

---

#### `stageItems` (Property)

**Type:** `TItem[]`

Staging area for transient rows or a single “current” row (e.g. inline editor context next to the list).

---

#### `stageRefs` (Property)

**Type:** `RefType[]`

Staging area for transient id/slug references (multi-select buffers, pending deletes, etc.).

---

#### `startTime` (Property)

**Type:** `number`

Timestamp when the async operation started

Used for:

- Performance tracking
- Operation timeout detection
- Loading time calculations

**Example:**

```ts
`Date.now()`;
```

---

#### `status` (Property)

**Type:** `AsyncStoreStatusType`

Current status of the async operation

Status values are defined by `AsyncStoreStatus`:

- `DRAFT`: Initial state, operation hasn't started
- `PENDING`: Operation is in progress
- `SUCCESS`: Operation completed successfully
- `FAILED`: Operation failed with an error
- `STOPPED`: Operation was manually stopped

---
