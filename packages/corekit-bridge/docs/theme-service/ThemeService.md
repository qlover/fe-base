## `src/core/theme-service/ThemeService` (Module)

**Type:** `unknown`

---

### `ThemeService` (Class)

**Type:** `unknown`

Store interface

Significance: Abstract base for all state stores
Core idea: Provide a unified API for state management with reset and clone helpers
Main function: Extend SliceStore, add resetState and cloneState utilities
Main purpose: Simplify store implementation and ensure consistency

**Example:**

```ts
class ChatStoreState implements StoreStateInterface {
  isChatRunning: boolean = false;
}

export class ChatStore extends StoreInterface<ChatStoreState> {
  constructor() {
    super(() => new ChatStoreState());
  }
}
```

---

#### `new ThemeService` (Constructor)

**Type:** `(props: ThemeServiceProps) => ThemeService`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `props` | `ThemeServiceProps` | ❌       | -       | -     | -          |             |

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `state` (Accessor)

**Type:** `unknown`

---

#### `bindToTheme` (Method)

**Type:** `() => void`

---

##### `bindToTheme` (CallSignature)

**Type:** `void`

---

#### `changeTheme` (Method)

**Type:** `(theme: string) => void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

---

##### `changeTheme` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

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

**Type:** `(source: Partial<ThemeServiceState>) => ThemeServiceState`

#### Parameters

| Name     | Type                         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ---------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<ThemeServiceState>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `ThemeServiceState`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type                         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ---------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<ThemeServiceState>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `emit` (Method)

**Type:** `(state: ThemeServiceState) => void`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description          |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `ThemeServiceState` | ❌       | -       | -     | -          | The new state object |

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

| Name    | Type                | Optional | Default | Since | Deprecated | Description          |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `ThemeServiceState` | ❌       | -       | -     | -          | The new state object |

---

#### `getSupportedThemes` (Method)

**Type:** `() => string[]`

---

##### `getSupportedThemes` (CallSignature)

**Type:** `string[]`

---

#### `getTarget` (Method)

**Type:** `() => HTMLElement`

---

##### `getTarget` (CallSignature)

**Type:** `HTMLElement`

---

#### `notify` (Method)

**Type:** `(value: ThemeServiceState, lastValue: ThemeServiceState) => void`

#### Parameters

| Name        | Type                | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `ThemeServiceState` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `ThemeServiceState` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

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

| Name        | Type                | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `ThemeServiceState` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `ThemeServiceState` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<ThemeServiceState, K> \| Listener<ThemeServiceState>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                                                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<ThemeServiceState, K> \| Listener<ThemeServiceState>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                                                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

| Name                 | Type                                                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<ThemeServiceState, K> \| Listener<ThemeServiceState>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                                                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

**Type:** `(value: ThemeServiceState) => this`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description                 |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `ThemeServiceState` | ❌       | -       | -     | -          | The new state object to set |

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

| Name    | Type                | Optional | Default | Since | Deprecated | Description                 |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `ThemeServiceState` | ❌       | -       | -     | -          | The new state object to set |

---

### `defaultThemeConfig` (Variable)

**Type:** `ThemeConfig`

**Default:** `...`

---
