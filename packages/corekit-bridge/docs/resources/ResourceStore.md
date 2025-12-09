## `src/core/resources/ResourceStore` (Module)

**Type:** `module src/core/resources/ResourceStore`

---

### `ResourceStore` (Class)

**Type:** `class ResourceStore<S>`

Store class for managing resource state

Provides methods for:

- Updating list state
- Managing search parameters
- Tracking initialization state

Uses immutable state updates through cloning

**Example:** Basic usage

```typescript
interface UserState extends ResourceStateInterface {
  // Additional state properties
}

const store = new ResourceStore<UserState>();
store.changeSearchParams({ page: 1, pageSize: 20 });
```

---

#### `new ResourceStore` (Constructor)

**Type:** `(stateFactory: Object) => ResourceStore<S>`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                           |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `stateFactory` | `Object` | ❌       | -       | -     | -          | () => T, factory function to create the initial state |

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `state` (Accessor)

**Type:** `accessor state`

---

#### `changeInitState` (Method)

**Type:** `(state: AsyncStateInterface<unknown>) => void`

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description              |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------ |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New initialization state |

---

##### `changeInitState` (CallSignature)

**Type:** `void`

Updates resource initialization state

Used during:

- Resource setup
- Configuration loading
- Initial data fetching

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description              |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------ |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New initialization state |

---

#### `changeListState` (Method)

**Type:** `(state: AsyncStateInterface<unknown>) => void`

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description    |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------- |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New list state |

---

##### `changeListState` (CallSignature)

**Type:** `void`

Updates the list loading state

Used when:

- Loading resource list
- Handling list operation results
- Tracking list operation errors

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description    |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------- |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New list state |

---

#### `changeSearchParams` (Method)

**Type:** `(params: Partial<ResourceQuery>) => void`

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `Partial<ResourceQuery>` | ❌       | -       | -     | -          | New search parameters |

---

##### `changeSearchParams` (CallSignature)

**Type:** `void`

Updates search parameters

Used for:

- Changing page number
- Updating sort order
- Modifying filter criteria

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `Partial<ResourceQuery>` | ❌       | -       | -     | -          | New search parameters |

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

**Type:** `(source: Partial<S>) => S`

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<S>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `S`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<S>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `emit` (Method)

**Type:** `(state: S) => void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description          |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `S`  | ❌       | -       | -     | -          | The new state object |

---

##### `emit` (CallSignature)

**Type:** `void`

Update the state and notify all observers

This method will replace the current state object and trigger all subscribed observers.
The observers will receive the new and old state as parameters.

**Example:**

```typescript
interface UserState {
  name: string;
  age: number;
}

const userStore = new SliceStore<UserState>({
  name: 'John',
  age: 20
});
userStore.emit({ name: 'Jane', age: 25 });
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description          |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `S`  | ❌       | -       | -     | -          | The new state object |

---

#### `notify` (Method)

**Type:** `(value: S, lastValue: S) => void`

#### Parameters

| Name        | Type | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `S`  | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `S`  | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

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
| `value`     | `S`  | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `S`  | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<S, K> \| Listener<S>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<S, K> \| Listener<S>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
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
| `selectorOrListener` | `Selector<S, K> \| Listener<S>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

#### `setDefaultState` (Method)

**Type:** `(value: S) => this`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                 |
| ------- | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `S`  | ❌       | -       | -     | -          | The new state object to set |

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
| `value` | `S`  | ❌       | -       | -     | -          | The new state object to set |

---

### `ResourceQuery` (Interface)

**Type:** `interface ResourceQuery`

Interface defining resource query parameters

Used for:

- Pagination control
- Sorting configuration
- Data filtering

**Example:** Basic query

```typescript
const query: ResourceQuery = {
  page: 1,
  pageSize: 20,
  orderBy: 'createdAt',
  order: 'desc'
};
```

---

#### `order` (Property)

**Type:** `unknown`

Sort order configuration

**Example:**

```ts
`'asc'` | `'desc'` | { direction: 'asc', nulls: 'last' };
```

---

#### `orderBy` (Property)

**Type:** `string`

Field name to sort by

**Example:**

```ts
`'createdAt'` | `'name'` | `'id'`;
```

---

#### `page` (Property)

**Type:** `number`

**Default:** `ts
1
`

Current page number for pagination

---

#### `pageSize` (Property)

**Type:** `number`

**Default:** `ts
10
`

Number of items per page

---

### `ResourceStateInterface` (Interface)

**Type:** `interface ResourceStateInterface`

Interface for resource state management

Extends the base store state interface with resource-specific
state tracking, including:

- Search parameter state
- Resource initialization state
- Resource list loading state

---

#### `initState` (Property)

**Type:** `AsyncStateInterface<unknown>`

Resource initialization state

---

#### `listState` (Property)

**Type:** `AsyncStateInterface<unknown>`

Resource list loading state

---

#### `searchParams` (Property)

**Type:** `ResourceQuery`

Current search parameters

---
