## `src/core/store-state/impl/PersistentStore` (Module)

**Type:** `module src/core/store-state/impl/PersistentStore`

---

### `PersistentStore` (Class)

**Type:** `class PersistentStore<T, Key, Opt>`

**Since:** `1.8.0`

Abstract persistent store interface

- Significance: Provides a base class for stores that need to persist state to storage
- Core idea: Extend
  `StoreInterface`
  with storage synchronization capabilities
- Main function: Automatically sync state changes to storage and load state from storage
- Main purpose: Enable state persistence with flexible storage backends

Core features:

- Automatic persistence: State changes via
  `emit()`
  are automatically persisted to storage
- Storage restoration: Load state from storage during initialization
- Flexible storage backends: Support any
  `SyncStorageInterface`
  implementation (localStorage, sessionStorage, cookies, etc.)
- Error resilience: Persistence failures don't prevent state updates
- Optional persistence: Can skip persistence during restore operations to prevent circular updates

Design decisions:

- Persistence errors are silently ignored to prevent state update failures
- Storage is optional (can be
  `null`
  ) to support stores that don't need persistence
- `restore()`
  is NOT called automatically by default (
  `initRestore`
  defaults to
  `false`
  )
  to avoid initialization order issues with subclass fields (e.g., storageKey)
- Subclasses should call
  `restore()`
  manually in their constructors after fields are initialized
- Subclasses must implement
  `restore()`
  and
  `persist()`
  to define storage-specific logic
- Expiration support: If a state needs expiration functionality, it can define an
  `expires`
  field
  in its own state interface (e.g.,
  `expires?: number | Date | null`
  ). The base interface
  doesn't enforce this, allowing subclasses to decide whether expiration is needed.

**Example:** Basic usage

```typescript
class MyStoreState implements StoreStateInterface {
  data: string = '';
}

class MyStore extends PersistentStoreInterface<MyStoreState, string> {
  private readonly storageKey = 'my-state';

  constructor(storage: SyncStorageInterface<string> | null = null) {
    super(() => new MyStoreState(), storage);
  }

  restore(): MyStoreState | null {
    if (!this.storage) return null;
    try {
      const value = this.storage.getItem(this.storageKey);
      if (value) {
        const restoredState = new MyStoreState();
        Object.assign(restoredState, value);
        // Update state without triggering persist
        this.emit(restoredState, { persist: false });
        return restoredState;
      }
    } catch {
      return null;
    }
    return null;
  }

  persist(state?: MyStoreState): void {
    if (!this.storage) return;
    const stateToPersist = state ?? this.state;
    this.storage.setItem(this.storageKey, stateToPersist);
  }
}
```

**Example:** With expiration support (optional)

```typescript
// State interface defines expiration field if needed
class ExpiringStoreState implements StoreStateInterface {
  data: string = '';
  expires?: number | Date | null; // Optional expiration support
}

class ExpiringStore extends PersistentStoreInterface<
  ExpiringStoreState,
  string
> {
  restore(): ExpiringStoreState | null {
    if (!this.storage) return null;
    try {
      const stored = this.storage.getItem('expiring-state');
      if (stored) {
        const state = new ExpiringStoreState();
        Object.assign(state, stored);

        // Check expiration if present
        if (state.expires) {
          const expiresAt =
            typeof state.expires === 'number'
              ? state.expires
              : state.expires.getTime();
          if (Date.now() > expiresAt) {
            // State expired, remove from storage
            this.storage.removeItem('expiring-state');
            return null;
          }
        }

        this.emit(state, { persist: false });
        return state;
      }
    } catch {
      return null;
    }
    return null;
  }

  persist(state?: ExpiringStoreState): void {
    if (!this.storage) return;
    const stateToPersist = state ?? this.state;
    this.storage.setItem('expiring-state', stateToPersist);
  }
}
```

---

#### `new PersistentStore` (Constructor)

**Type:** `(stateFactory: Object, storage: null \| SyncStorageInterface<Key, Opt>, initRestore: boolean) => PersistentStore<T, Key, Opt>`

#### Parameters

| Name                                                                                  | Type                                     | Optional | Default | Since | Deprecated | Description                                                                         |
| ------------------------------------------------------------------------------------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------- |
| `stateFactory`                                                                        | `Object`                                 | ❌       | -       | -     | -          | Factory function that creates a new instance of state type `T`                      |
| Used to initialize the store state and reset state to defaults                        |
| `storage`                                                                             | `null \| SyncStorageInterface<Key, Opt>` | ✅       | `null`  | -     | -          | Storage implementation for persisting state, or `null` if persistence is not needed |
| When `null`, `restore()` and `persist()` methods will not perform any operations      |
| `initRestore`                                                                         | `boolean`                                | ✅       | `false` | -     | -          | Whether to automatically restore state from storage during construction             |
| Set to `true` only if subclass fields are not needed for restore() (e.g., storageKey) |

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `storage` (Property)

**Type:** `null \| SyncStorageInterface<Key, Opt>`

**Default:** `null`

Storage implementation for persisting state, or
`null`
if persistence is not needed
When
`null`
,
`restore()`
and
`persist()`
methods will not perform any operations

---

#### `state` (Accessor)

**Type:** `accessor state`

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clear all observers

This method removes all registered listeners and their last selected values.
It is useful when the component is unloaded or needs to reset the observer state.

**Example:**

```typescript
// Register some observers
observer.observe((state) => console.log(state));

// Remove all observers
observer.clear();

// Now notifications will not trigger any listeners
observer.notify({ count: 3 });
```

---

#### `cloneState` (Method)

**Type:** `(source: Partial<T>) => T`

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<T>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `T`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<T>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `emit` (Method)

**Type:** `(state: T, options: Object) => void`

#### Parameters

| Name              | Type      | Optional | Default | Since | Deprecated | Description                              |
| ----------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `state`           | `T`       | ❌       | -       | -     | -          | The new state to emit and persist        |
| `options`         | `Object`  | ✅       | -       | -     | -          | Optional configuration for emit behavior |
| `options.persist` | `boolean` | ✅       | -       | -     | -          | Whether to persist state to storage      |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations to prevent circular updates |

---

##### `emit` (CallSignature)

**Type:** `void`

**Default:** `true`

Emit state changes and automatically sync to storage

Overrides the base
`emit()`
method to add automatic persistence functionality.
When state is emitted, it is automatically persisted to storage (if configured)
unless explicitly disabled via options.

Behavior:

- Emits state change to all observers (via parent
  `emit()`
  )
- Automatically persists state to storage if
  `persist`
  option is not
  `false`
  and storage is configured
- Persistence failures are silently ignored to prevent state update failures
- State update always succeeds even if persistence fails

Error handling:

- If persistence fails (e.g., storage quota exceeded, permission denied, storage unavailable),
  the error is caught and silently ignored
- State update still succeeds, ensuring application functionality is not affected
- Subclasses can override this method to implement custom error handling if needed

**Example:** Normal emit with automatic persistence

```typescript
// State is emitted and automatically persisted
this.emit(newState);
```

**Example:** Emit without persistence (during restore)

```typescript
restore(): MyStoreState | null {
  if (!this.storage) return null;
  try {
    const stored = this.storage.getItem('my-state');
    if (stored) {
      const restoredState = new MyStoreState();
      Object.assign(restoredState, stored);
      // Update state without triggering persist to avoid circular updates
      this.emit(restoredState, { persist: false });
      return restoredState;
    }
  } catch {
    return null;
  }
  return null;
}
```

**Example:** Custom error handling in subclass

```typescript
override emit(state: T, options?: { persist?: boolean }): void {
  super.emit(state);

  const shouldPersist = options?.persist !== false && this.storage;
  if (!shouldPersist) {
    return;
  }

  try {
    this.persist(state);
  } catch (error) {
    // Custom error handling (e.g., logging, retry logic)
    console.error('Failed to persist state:', error);
    // Optionally notify error handlers or retry persistence
  }
}
```

#### Parameters

| Name              | Type      | Optional | Default | Since | Deprecated | Description                              |
| ----------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `state`           | `T`       | ❌       | -       | -     | -          | The new state to emit and persist        |
| `options`         | `Object`  | ✅       | -       | -     | -          | Optional configuration for emit behavior |
| `options.persist` | `boolean` | ✅       | -       | -     | -          | Whether to persist state to storage      |

- `true` or `undefined`: Persist state to storage (default behavior)
- `false`: Skip persistence, useful during restore operations to prevent circular updates |

---

#### `getStorage` (Method)

**Type:** `() => null \| SyncStorageInterface<Key, Opt>`

---

##### `getStorage` (CallSignature)

**Type:** `null \| SyncStorageInterface<Key, Opt>`

Get the storage instance

Returns the storage implementation used by this store for persistence operations.
Returns
`null`
if no storage was configured during construction.

Use cases:

- Check if persistence is enabled
- Access storage for custom operations
- Pass storage to other components

**Returns:**

The storage instance or
`null`
if not configured

**Example:** Check if storage is available

```typescript
const storage = store.getStorage();
if (storage) {
  // Storage is available, perform custom operations
  storage.clear();
}
```

**Example:** Access storage for custom operations

```typescript
const storage = store.getStorage();
if (storage) {
  const customKey = 'custom-data' as Key;
  storage.setItem(customKey, customValue);
}
```

---

#### `notify` (Method)

**Type:** `(value: T, lastValue: T) => void`

#### Parameters

| Name        | Type | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `T`  | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `T`  | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

##### `notify` (CallSignature)

**Type:** `void`

Notify all observers that the state has changed

This method will iterate through all registered observers and call their listeners.
If an observer has a selector, it will only notify when the selected state part changes.

**Example:**

```typescript
// Notify observers that the state has changed
observer.notify({ count: 2, name: 'New name' });

// Provide the previous state for comparison
const oldState = { count: 1, name: 'Old name' };
const newState = { count: 2, name: 'New name' };
observer.notify(newState, oldState);
```

#### Parameters

| Name        | Type | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `T`  | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `T`  | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<T, K> \| Listener<T>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<T, K> \| Listener<T>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

##### `observe` (CallSignature)

**Type:** `Object`

Register an observer to listen for state changes

This method supports two calling methods:

1. Provide a listener that listens to the entire state
2. Provide a selector and a listener that listens to the selected part

**Returns:**

The function to unsubscribe, calling it removes the registered observer

**Example:** Listen to the entire state

```typescript
const unsubscribe = observer.observe((state) => {
  console.log('Full state:', state);
});

// Unsubscribe
unsubscribe();
```

**Example:** Listen to a specific part of the state

```typescript
const unsubscribe = observer.observe(
  (state) => state.user,
  (user) => console.log('User information changed:', user)
);
```

#### Parameters

| Name                 | Type                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<T, K> \| Listener<T>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

#### `persist` (Method)

**Type:** `(state: S) => void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description               |
| ------- | ---- | -------- | ------- | ----- | ---------- | ------------------------- |
| `state` | `S`  | ✅       | -       | -     | -          | Optional state to persist |

- If provided: Persist the specified state object
- If `undefined`: Persist the current store state (`this.state`) |

---

##### `persist` (CallSignature)

**Type:** `void`

**Default:** `this.state`

Persist current state to storage

This abstract method must be implemented by subclasses to define how state is persisted
to storage. It is called automatically by
`emit()`
when state changes (only if storage
is configured and
`persist`
option is not
`false`
).

Implementation requirements:

- Check if storage is configured (
  `this.storage`
  is not
  `null`
  )
- Serialize state data appropriately for the storage backend
- Use storage-specific keys to store the state
- Handle storage-specific options if needed (via
  `Opt`
  type parameter)
- Do nothing if storage is not configured (graceful no-op)

Error handling:

- This method may throw errors (e.g., storage quota exceeded, permission denied, storage unavailable)
- Errors thrown here are caught by
  `emit()`
  to prevent state update failures
- The state update will still succeed even if persistence fails
- Subclasses can implement retry logic or error recovery if needed

When called:

- Automatically called by
  `emit()`
  after state is updated (unless
  `{ persist: false }`
  is specified)
- Can be called manually to force persistence of current state
- Can be called with a specific state to persist that state instead of current state

**Returns:**

`void`

- Persisting is a side effect operation with no return value

**Throws:**

May throw errors if storage operations fail, including:

- `QuotaExceededError`
  : Storage quota exceeded (e.g., localStorage full)
- `SecurityError`
  : Permission denied (e.g., in private browsing mode)
- `TypeError`
  : Invalid data type for storage
- Storage-specific errors from the storage implementation

**Example:** Basic implementation

```typescript
persist(state?: MyStoreState): void {
  if (!this.storage) return;
  const stateToPersist = state ?? this.state;
  this.storage.setItem('my-state', stateToPersist);
}
```

**Example:** With storage key

```typescript
private readonly storageKey = 'my-app-state';

persist(state?: MyStoreState): void {
  if (!this.storage) return;
  const stateToPersist = state ?? this.state;
  this.storage.setItem(this.storageKey, stateToPersist);
}
```

**Example:** With storage options

```typescript
persist(state?: MyStoreState): void {
  if (!this.storage) return;
  const stateToPersist = state ?? this.state;
  const options: Opt = {
    expires: stateToPersist.expires
      ? (typeof stateToPersist.expires === 'number'
          ? stateToPersist.expires
          : stateToPersist.expires.getTime())
      : undefined
  };
  this.storage.setItem('my-state', stateToPersist, options);
}
```

**Example:** Persisting only specific fields

```typescript
persist(state?: MyStoreState): void {
  if (!this.storage) return;
  const stateToPersist = state ?? this.state;
  // Only persist the data field, not the entire state
  this.storage.setItem('my-state-data', stateToPersist.data);
}
```

**Example:** Manual persistence

```typescript
// Force persistence of current state
store.persist();

// Persist a specific state
const customState = new MyStoreState();
customState.data = 'custom data';
store.persist(customState);
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description               |
| ------- | ---- | -------- | ------- | ----- | ---------- | ------------------------- |
| `state` | `S`  | ✅       | -       | -     | -          | Optional state to persist |

- If provided: Persist the specified state object
- If `undefined`: Persist the current store state (`this.state`) |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

**Since:** `1.2.5`

Reset the state to the initial value

This method will use the maker provided in the constructor to create a new state object,
and then emit it as the current state, triggering a notification to all observers.

Use cases:

- When you need to clear all state
- When you need to restore to the initial state
- When the current state is polluted or invalid

**Example:**

```typescript
const store = new SliceStore(MyStateClass);
// ... some operations modified the state ...
store.reset(); // The state is reset to the initial value
```

---

#### `resetState` (Method)

**Type:** `() => void`

---

##### `resetState` (CallSignature)⚠️

**Type:** `void`

Reset the state of the store

**Returns:**

void

---

#### `restore` (Method)

**Type:** `() => null \| R`

---

##### `restore` (CallSignature)

**Type:** `null \| R`

Restore state from storage and merge with current state

This abstract method must be implemented by subclasses to define how state is restored
from storage. It is called automatically during construction (if
`initRestore`
is
`true`
)
and can also be called manually to refresh state from storage.

Implementation requirements:

- Check if storage is configured (
  `this.storage`
  is not
  `null`
  )
- Retrieve state from storage using storage-specific keys
- Validate and transform stored data into the expected state type
- Handle expiration checks if the state interface defines an
  `expires`
  field
- Update store state using
  `emit()`
  with
  `{ persist: false }`
  to prevent circular updates
- Return
  `null`
  if storage is not configured, no state is found, or restoration fails

Error handling:

- Should catch and handle storage errors gracefully
- Return
  `null`
  on any error to indicate restoration failure
- Should not throw errors that would break store initialization

State update pattern:

- Always use
  `this.emit(restoredState, { persist: false })`
  when updating state during restore
- This prevents triggering
  `persist()`
  which would write back to storage unnecessarily
- The
  `{ persist: false }`
  option ensures no circular updates occur

**Returns:**

The restored state of type
`R`
, or
`null`
if:

- Storage is not configured (
  `this.storage`
  is
  `null`
  )
- No state is found in storage
- State restoration fails (e.g., invalid data, storage error)
- State has expired (if expiration checking is implemented)

**Example:** Basic implementation

```typescript
restore(): MyStoreState | null {
  if (!this.storage) return null;
  try {
    const value = this.storage.getItem('my-state');
    if (value) {
      const restoredState = new MyStoreState();
      Object.assign(restoredState, value);
      // Update state without triggering persist
      this.emit(restoredState, { persist: false });
      return restoredState;
    }
  } catch {
    return null;
  }
  return null;
}
```

**Example:** With expiration checking (if state interface defines expires field)

```typescript
interface MyStoreState extends StoreStateInterface {
  data: string;
  expires?: number | Date | null; // Optional expiration field
}

restore(): MyStoreState | null {
  if (!this.storage) return null;
  try {
    const stored = this.storage.getItem('my-state') as MyStoreState | null;
    if (stored) {
      // Check expiration if present
      if (stored.expires) {
        const expiresAt = typeof stored.expires === 'number'
          ? stored.expires
          : stored.expires.getTime();
        if (Date.now() > expiresAt) {
          // State expired, remove from storage
          this.storage.removeItem('my-state');
          return null;
        }
      }

      const restoredState = new MyStoreState();
      Object.assign(restoredState, stored);
      this.emit(restoredState, { persist: false });
      return restoredState;
    }
  } catch {
    return null;
  }
  return null;
}
```

**Example:** Returning partial state (custom return type)

```typescript
// Restore only the result value, not the full state
restore(): string | null {
  if (!this.storage) return null;
  try {
    const state = this.storage.getItem('my-state') as MyStoreState | null;
    if (state) {
      this.emit(state, { persist: false });
      return state.data; // Return only the data field
    }
  } catch {
    return null;
  }
  return null;
}
```

---

#### `setDefaultState` (Method)

**Type:** `(value: T) => this`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                 |
| ------- | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `T`  | ❌       | -       | -     | -          | The new state object to set |

---

##### `setDefaultState` (CallSignature)⚠️

**Type:** `this`

Set the default state

Replace the entire state object, but will not trigger the observer notification.
This method is mainly used for initialization, not recommended for regular state updates.

**Returns:**

The current instance, supporting method chaining

**Example:**

```typescript
// Not recommended to use
store.setDefaultState(initialState);

// Recommended alternative
store.emit(initialState);
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                 |
| ------- | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `T`  | ❌       | -       | -     | -          | The new state object to set |

---
