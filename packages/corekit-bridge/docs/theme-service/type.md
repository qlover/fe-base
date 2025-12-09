## `src/core/theme-service/type` (Module)

**Type:** `module src/core/theme-service/type`

---

### `ThemeServiceProps` (Interface)

**Type:** `interface ThemeServiceProps`

---

#### `cacheTarget` (Property)

**Type:** `boolean`

**Default:** `true`

Whether to cache the target

---

#### `defaultTheme` (Property)

**Type:** `string`

**Default:** `ts
'system'
`

The default theme

---

#### `domAttribute` (Property)

**Type:** `string`

**Default:** `ts
'data-theme'
`

The dom attribute

---

#### `init` (Property)

**Type:** `boolean`

**Default:** `true`

Whether to initialize the theme

---

#### `prioritizeStore` (Property)

**Type:** `boolean`

**Default:** `true`

Whether to prioritize the store

---

#### `storage` (Property)

**Type:** `SyncStorageInterface<string, string>`

---

#### `storageKey` (Property)

**Type:** `string`

**Default:** `ts
'theme'
`

The storage key

---

#### `supportedThemes` (Property)

**Type:** `string[]`

**Default:** `ts
['light', 'dark']
`

The supported themes

---

#### `target` (Property)

**Type:** `string \| HTMLElement`

**Default:** `ts
'html'
`

The target element

- Dom id(# startwith)
- Dom Element
- Dom Tag name

---

### `ThemeServiceState` (Interface)

**Type:** `interface ThemeServiceState`

Store state interface

Significance: Defines the contract for store state objects
Core idea: Enforce a consistent structure for store state
Main function: Used as a base for all store state types
Main purpose: Type safety and extensibility for store state

**Example:**

```ts
class ChatStoreState implements StoreStateInterface {
  isChatRunning: boolean = false;
}
```

---

#### `theme` (Property)

**Type:** `string`

---

### `ThemeConfig` (TypeAlias)

**Type:** `Object`

---

#### `cacheTarget` (Property)

**Type:** `boolean`

**Default:** `true`

Whether to cache the target

---

#### `defaultTheme` (Property)

**Type:** `string`

**Default:** `ts
'system'
`

The default theme

---

#### `domAttribute` (Property)

**Type:** `string`

**Default:** `ts
'data-theme'
`

The dom attribute

---

#### `init` (Property)

**Type:** `boolean`

**Default:** `true`

Whether to initialize the theme

---

#### `prioritizeStore` (Property)

**Type:** `boolean`

**Default:** `true`

Whether to prioritize the store

---

#### `storageKey` (Property)

**Type:** `string`

**Default:** `ts
'theme'
`

The storage key

---

#### `supportedThemes` (Property)

**Type:** `string[]`

**Default:** `ts
['light', 'dark']
`

The supported themes

---

#### `target` (Property)

**Type:** `string \| HTMLElement`

**Default:** `ts
'html'
`

The target element

- Dom id(# startwith)
- Dom Element
- Dom Tag name

---
