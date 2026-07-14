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

**Type:** `StorageInterface<string, string, unknown>`

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

#### `themeTokens` (Property)

**Type:** `Record<string, ThemeTokens>`

Per-theme token sets

**Example:**

```ts
{
   *   light: { 'color-primary': '246 248 250' },
   * }
```

---

#### `tokenMapping` (Property)

**Type:** `TokenMapping`

The token mapping

**Example:**

```ts
{
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   * }
```

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

The current theme

**Example:**

```ts
'light';
```

---

#### `themeTokens` (Property)

**Type:** `Record<string, ThemeTokens>`

Per-theme token sets (theme id → tokens)

---

#### `themes` (Property)

**Type:** `string[]`

The supported themes

**Example:**

```ts
['light', 'dark'];
```

---

#### `tokenMapping` (Property)

**Type:** `TokenMapping`

The token mapping

**Example:**

```ts
{
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   * }
```

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

#### `themeTokens` (Property)

**Type:** `Record<ThemeId, ThemeTokens>`

Per-theme token sets

**Example:**

```ts
{
   *   light: { 'color-primary': '246 248 250' },
   * }
```

---

#### `tokenMapping` (Property)

**Type:** `TokenMapping`

The token mapping

**Example:**

```ts
{
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   * }
```

---
